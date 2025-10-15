import { createCookieSessionStorage } from "@remix-run/node";

// Create our own cookie session storage for JWT tokens
export const jwtSessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__fishook_session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET || "s3cr3t-change-this-in-production"],
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
});

// Helper to get session from request
export async function getJWTSession(request: Request) {
  return jwtSessionStorage.getSession(request.headers.get("Cookie"));
}

// Store JWT tokens in cookie session
export async function storeJWTTokens(
  request: Request,
  jwtToken: string,
  refreshToken: string,
) {
  const session = await getJWTSession(request);

  session.set("jwtToken", jwtToken);
  session.set("refreshJwtToken", refreshToken);
  session.set("timestamp", new Date().toISOString());

  console.log("✅ JWT tokens stored in cookie session");

  return session;
}

// Retrieve JWT tokens from cookie session
export async function getJWTTokens(request: Request) {
  const session = await getJWTSession(request);

  return {
    jwtToken: session.get("jwtToken") as string | undefined,
    refreshJwtToken: session.get("refreshJwtToken") as string | undefined,
    timestamp: session.get("timestamp") as string | undefined,
  };
}

// Clear JWT tokens from session
export async function clearJWTTokens(request: Request) {
  const session = await getJWTSession(request);

  session.unset("jwtToken");
  session.unset("refreshJwtToken");
  session.unset("timestamp");

  console.log("🗑️ JWT tokens cleared from cookie session");

  return session;
}
