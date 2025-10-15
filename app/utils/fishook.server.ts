import CryptoJS from "crypto-js";

// API Base URL
const API_BASE_URL = "https://dashboard-api.fishook.online";

// Encryption secret key (from backend)
const SECRET_KEY =
  "$2a$10$YqnDG0Fu5.MdXVBlm9gRI.D75C0$YqnDG0Fu5.$10$YqnDG0Fu5.MdXVBlm9gR-i8cbLojkjfyba-.D75CQQvBU0.pGyrfGdFXAEAHrcLq3Tsa";

/**
 * Encrypt Shopify access token for Fishook API
 */
function encryptAccessToken(accessToken: string): string {
  return CryptoJS.AES.encrypt(accessToken, SECRET_KEY).toString();
}

/**
 * Server-side Fishook API Client
 * All API calls happen on the server with encrypted Shopify access token
 */
class FishookApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    accessToken: string,
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const encryptedToken = encryptAccessToken(accessToken);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${encryptedToken}`,
      ...(options.headers as Record<string, string>),
    };

    console.log(`🔐 [Server] Making request to ${endpoint}`);

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`❌ [Server] API Error (${response.status}):`, errorData);
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`,
      );
    }

    const data = await response.json();
    console.log(`✅ [Server] Response from ${endpoint}:`, data);
    return data;
  }

  /**
   * Get billing data and interactions
   */
  async getBillingData(accessToken: string) {
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
    }>(accessToken, "/shopify/admin/billings/interactions", {
      method: "GET",
    });
  }

  /**
   * Top up wallet
   */
  async topUpWallet(accessToken: string, amount: number) {
    return this.request<{
      status_code: number;
      message: string;
      data: any;
    }>(accessToken, "/shopify/topup-wallet", {
      method: "POST",
      body: JSON.stringify({ amount }),
    });
  }

  /**
   * Get available plans
   */
  async getPlans(accessToken: string) {
    return this.request<{
      status_code: number;
      message: string;
      data: Array<{
        uuid: string;
        is_current_plan: boolean;
        price: string;
        description: string;
        name: string;
        credit_limit: number;
        features: Array<{
          uuid: string;
          feature_is_enabled: boolean;
          feature: {
            uuid: string;
            code: string;
            description: string;
            name: string;
          };
          limit_value: number | null;
        }>;
      }>;
    }>(accessToken, "/shopify/plans", {
      method: "GET",
    });
  }

  /**
   * Upgrade to a different plan
   */
  async upgradePlan(accessToken: string, planId: string) {
    return this.request<{
      status_code: number;
      message: string;
      data: any;
    }>(accessToken, `/shopify/plans/${planId}`, {
      method: "PUT",
    });
  }
}

export const fishookApi = new FishookApiClient(API_BASE_URL);
