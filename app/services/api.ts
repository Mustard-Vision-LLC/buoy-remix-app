// API Base URL
const API_BASE_URL = "https://dashboard-api.fishook.online";

// Token management
export const tokenManager = {
  setTokens: (jwtToken: string, refreshToken: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("jwt_token", jwtToken);
      localStorage.setItem("refresh_jwt_token", refreshToken);
    }
  },

  getToken: () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("jwt_token");
    }
    return null;
  },

  getRefreshToken: () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("refresh_jwt_token");
    }
    return null;
  },

  clearTokens: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("jwt_token");
      localStorage.removeItem("refresh_jwt_token");
    }
  },
};

// API Client with automatic token refresh
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const token = tokenManager.getToken();

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
      const refreshToken = tokenManager.getRefreshToken();
      if (refreshToken) {
        const newTokens = await this.refreshToken(refreshToken);
        tokenManager.setTokens(
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
    return this.request<{
      status_code: number;
      message: string;
      data: {
        shop: {
          shop_url: string;
          script_tag_id: string;
          platform: string;
        };
        jwtDetails: {
          jwt_token: string;
          refresh_jwt_token: string;
        };
      };
    }>("/shopify/admin/init", {
      method: "POST",
      body: JSON.stringify({
        shop_url,
        access_token,
        shop_type: "SHOPIFY",
      }),
    });
  }

  async refreshToken(refresh_jwt_token: string) {
    const response = await this.request<{
      status_code: number;
      message: string;
      data: {
        jwt_token: string;
        refresh_jwt_token: string;
      };
    }>("/shopify/admin/refresh-token", {
      method: "PUT",
      body: JSON.stringify({ refresh_jwt_token }),
    });
    return response.data;
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
