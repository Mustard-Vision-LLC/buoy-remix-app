// API Base URL
const API_BASE_URL = "https://dashboard-api.fishook.online";

// Helper to get cookie value by name (client-side)
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const cookieValue = parts.pop()?.split(";").shift();
    if (cookieValue) {
      try {
        // Decode the session cookie (it's URL encoded)
        const decoded = decodeURIComponent(cookieValue);
        // Parse the session data (format: "session:xxxx")
        const sessionMatch = decoded.match(/"jwt_token":"([^"]+)"/);
        if (sessionMatch) {
          return sessionMatch[1];
        }
      } catch (e) {
        console.error("Error parsing cookie:", e);
      }
    }
  }
  return null;
}

// Helper to get refresh token from cookie
function getRefreshTokenFromCookie(): string | null {
  if (typeof document === "undefined") return null;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; __fishook_session=`);
  if (parts.length === 2) {
    const cookieValue = parts.pop()?.split(";").shift();
    if (cookieValue) {
      try {
        const decoded = decodeURIComponent(cookieValue);
        const sessionMatch = decoded.match(/"refresh_jwt_token":"([^"]+)"/);
        if (sessionMatch) {
          return sessionMatch[1];
        }
      } catch (e) {
        console.error("Error parsing cookie:", e);
      }
    }
  }
  return null;
}

// API Client with automatic token refresh (client-side only)
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const token = getCookie("__fishook_session");

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
    });

    // Handle token expiration
    if (response.status === 401) {
      const refreshToken = getRefreshTokenFromCookie();
      if (refreshToken) {
        const newTokens = await this.refreshToken(refreshToken);

        // Retry the original request with new token
        headers["Authorization"] = `Bearer ${newTokens.jwt_token}`;
        const retryResponse = await fetch(`${this.baseURL}${endpoint}`, {
          ...options,
          headers,
        });

        if (!retryResponse.ok) {
          throw new Error(`HTTP error! status: ${retryResponse.status}`);
        }

        return retryResponse.json();
      }
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Authentication endpoints
  async login(shop_url: string, access_token: string) {
    // Remove https:// prefix if present
    const formattedShopUrl = shop_url.replace(/^https?:\/\//, "");

    const response = await fetch(`${this.baseURL}/shopify/admin/init`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        shop_url: formattedShopUrl,
        access_token,
        shop_type: "SHOPIFY",
      }),
    });

    const data = await response.json();

    if (data.status_code !== 200 || !data.data?.jwtDetails) {
      console.error("❌ Fishook login failed:", data);
      throw new Error(data.message || "Failed to login to Fishook");
    }

    return data;
  }

  async refreshToken(refresh_jwt_token: string) {
    const response = await fetch(
      `${this.baseURL}/shopify/admin/refresh-token`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_jwt_token }),
      },
    );

    const data = await response.json();

    if (data.status_code !== 200 || !data.data) {
      throw new Error(data.message || "Failed to refresh token");
    }

    return data.data;
  }

  // Billing endpoints
  async getBillingData() {
    return this.request<{
      status_code: number;
      message: string;
      data: {
        extra_bundle: boolean;
        balance: string;
        extra_bundle_cost: string;
        current_plan: {
          name: string;
          cost_per_token: string;
        };
        connected_stores: {
          active: number;
          inactive: number;
          total_stores: number;
        };
        customers: number;
        total_store_interactions: number;
        total_store_interaction_cost: number;
        total_store_interaction_token_balance: number;
      };
    }>("/shopify/admin/billings/interactions", {
      method: "GET",
    });
  }

  async topUpWallet(amount: number) {
    return this.request<{
      status_code: number;
      message: string;
      data: any;
    }>("/shopify/topup-wallet", {
      method: "POST",
      body: JSON.stringify({ amount }),
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
