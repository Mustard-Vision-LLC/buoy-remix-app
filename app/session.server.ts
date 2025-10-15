import { createCookieSessionStorage } from "@remix-run/node";

const API_BASE_URL = "https://dashboard-api.fishook.online";

// Create our own cookie session storage for JWT tokens
export const jwtSessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__fishook_session",
    httpOnly: true,
    path: "/",
    sameSite: "none", // Required for embedded apps in iframes
    secrets: [process.env.SESSION_SECRET || "s3cr3t-change-this-in-production"],
    secure: true, // Must be true when sameSite is "none"
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
});

// Helper to get session from request
export async function getJWTSession(request: Request) {
  return jwtSessionStorage.getSession(request.headers.get("Cookie"));
}

// Login to Fishook API and store tokens
export async function loginToFishook(
  request: Request,
  shopUrl: string,
  accessToken: string,
) {
  console.log("🔐 Logging into Fishook API...");

  const response = await fetch(`${API_BASE_URL}/shopify/admin/init`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      shop_url: shopUrl,
      access_token: accessToken,
      shop_type: "SHOPIFY",
    }),
  });

  const data = await response.json();

  if (data.status_code !== 200 || !data.data?.jwtDetails) {
    console.error("❌ Fishook login failed:", data);
    throw new Error(data.message || "Failed to login to Fishook");
  }

  // Store tokens in session
  const session = await getJWTSession(request);
  session.set("jwt_token", data.data.jwtDetails.jwt_token);
  session.set("refresh_jwt_token", data.data.jwtDetails.refresh_jwt_token);
  session.set("shop_url", shopUrl);
  session.set("timestamp", new Date().toISOString());

  console.log("✅ Fishook login successful, tokens stored");

  return {
    session,
    shopData: data.data.shop,
    jwtToken: data.data.jwtDetails.jwt_token,
  };
}

// Get JWT token from session (with auto-refresh if needed)
export async function getJWTToken(request: Request) {
  const session = await getJWTSession(request);
  const jwtToken = session.get("jwt_token") as string | undefined;
  const refreshToken = session.get("refresh_jwt_token") as string | undefined;

  if (!jwtToken || !refreshToken) {
    return null;
  }

  // TODO: Add token expiry check and refresh logic here if needed
  return jwtToken;
}

// Refresh JWT token
export async function refreshJWTToken(request: Request) {
  const session = await getJWTSession(request);
  const refreshToken = session.get("refresh_jwt_token") as string | undefined;

  if (!refreshToken) {
    throw new Error("No refresh token found");
  }

  console.log("🔄 Refreshing JWT token...");

  const response = await fetch(`${API_BASE_URL}/shopify/admin/refresh-token`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      refresh_jwt_token: refreshToken,
    }),
  });

  const data = await response.json();

  if (data.status_code !== 200 || !data.data) {
    console.error("❌ Token refresh failed:", data);
    throw new Error(data.message || "Failed to refresh token");
  }

  // Update session with new tokens
  session.set("jwt_token", data.data.jwt_token);
  session.set("refresh_jwt_token", data.data.refresh_jwt_token);
  session.set("timestamp", new Date().toISOString());

  console.log("✅ JWT token refreshed successfully");

  return {
    session,
    jwtToken: data.data.jwt_token,
  };
}

// Fetch billing data from Fishook API
export async function getBillingData(request: Request) {
  const jwtToken = await getJWTToken(request);

  if (!jwtToken) {
    throw new Error("Not authenticated");
  }

  console.log("📊 Fetching billing data...");

  const response = await fetch(
    `${API_BASE_URL}/shopify/admin/billings/interactions`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtToken}`,
      },
    },
  );

  const data = await response.json();

  if (data.status_code !== 200) {
    console.error("❌ Billing data fetch failed:", data);

    // If 401, try refreshing token
    if (response.status === 401) {
      const { session: newSession, jwtToken: newToken } =
        await refreshJWTToken(request);

      // Retry with new token
      const retryResponse = await fetch(
        `${API_BASE_URL}/shopify/admin/billings/interactions`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${newToken}`,
          },
        },
      );

      const retryData = await retryResponse.json();

      if (retryData.status_code !== 200) {
        throw new Error(retryData.message || "Failed to fetch billing data");
      }

      return { data: retryData.data, session: newSession };
    }

    throw new Error(data.message || "Failed to fetch billing data");
  }

  console.log("✅ Billing data fetched successfully");

  return { data: data.data, session: null };
}

// Top up wallet
export async function topUpWallet(request: Request, amount: number) {
  const jwtToken = await getJWTToken(request);

  if (!jwtToken) {
    throw new Error("Not authenticated");
  }

  console.log(`💰 Topping up wallet with $${amount}...`);

  const response = await fetch(`${API_BASE_URL}/shopify/topup-wallet`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwtToken}`,
    },
    body: JSON.stringify({ amount }),
  });

  const data = await response.json();

  if (data.status_code !== 200) {
    console.error("❌ Wallet top-up failed:", data);
    throw new Error(data.message || "Failed to top up wallet");
  }

  console.log("✅ Wallet topped up successfully");

  return data.data;
}

// Clear session
export async function clearSession(request: Request) {
  const session = await getJWTSession(request);
  session.unset("jwt_token");
  session.unset("refresh_jwt_token");
  session.unset("shop_url");
  session.unset("timestamp");

  console.log("🗑️ Session cleared");

  return session;
}
