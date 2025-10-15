import { getJWTToken, getRefreshToken, setTokens } from "../session.server";

// API Base URL
const API_BASE_URL = "https://dashboard-api.fishook.online";

// API Client with automatic token refresh (server-side only)
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    request: Request,
    options: RequestInit = {},
  ): Promise<{ data: T; session?: any }> {
    const token = await getJWTToken(request);

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
      const refreshToken = await getRefreshToken(request);
      if (refreshToken) {
        const newTokens = await this.refreshToken(refreshToken);
        const session = await setTokens(
          request,
          newTokens.jwt_token,
          newTokens.refresh_jwt_token,
        );

        // Retry the original request with new token
        headers["Authorization"] = `Bearer ${newTokens.jwt_token}`;
        const retryResponse = await fetch(`${this.baseURL}${endpoint}`, {
          ...options,
          headers,
        });

        if (!retryResponse.ok) {
          throw new Error(`HTTP error! status: ${retryResponse.status}`);
        }

        const retryData = await retryResponse.json();
        return { data: retryData, session };
      }
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { data, session: null };
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
  async getBillingData(request: Request) {
    const result = await this.request<{
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
    }>("/shopify/admin/billings/interactions", request, {
      method: "GET",
    });

    return result;
  }

  async topUpWallet(request: Request, amount: number) {
    const result = await this.request<{
      status_code: number;
      message: string;
      data: any;
    }>("/shopify/topup-wallet", request, {
      method: "POST",
      body: JSON.stringify({ amount }),
    });

    return result;
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
