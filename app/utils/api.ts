import CryptoJS from "crypto-js";

// API Base URL
const API_BASE_URL = "https://dashboard-api.fishook.online";

// Encryption secret key (from backend)
const SECRET_KEY =
  "$2a$10$YqnDG0Fu5.MdXVBlm9gRI.D75C0$YqnDG0Fu5.$10$YqnDG0Fu5.MdXVBlm9gR-i8cbLojkjfyba-.D75CQQvBU0.pGyrfGdFXAEAHrcLq3Tsa";

// Store access token (in-memory, will be set by loader data)
let shopifyAccessToken: string | null = null;

// Set access token (called when component receives loader data)
export function setAccessToken(accessToken: string) {
  shopifyAccessToken = accessToken;
}

let shopUrl: string | null = null;

export function setShopUrl(shop: string) {
  shopUrl = shop;
}

// Get encrypted access token
function getEncryptedAccessToken(): string | null {
  if (!shopifyAccessToken) return null;

  // Encrypt the Shopify access token
  const encrypted = CryptoJS.AES.encrypt(
    shopifyAccessToken,
    SECRET_KEY,
  ).toString();
  console.log(encrypted, "encrypted");
  return encrypted;
}

// API Client with encrypted access token as bearer
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const encryptedToken = getEncryptedAccessToken();

    if (!encryptedToken) {
      throw new Error("Access token not available");
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${encryptedToken}`,
      ...(options.headers as Record<string, string>),
    };

    if (shopUrl) {
      headers["x-shopify-shop-domain"] = shopUrl;
    }

    console.log(`🔐 Making request to ${endpoint} with encrypted token`);

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`❌ API Error (${response.status}):`, errorData);
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`,
      );
    }

    const data = await response.json();
    console.log(`✅ Response from ${endpoint}:`, data);
    return data;
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

  async getPlans() {
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
    }>("/shopify/plans", {
      method: "GET",
    });
  }

  async upgradePlan(planId: string) {
    return this.request<{
      status_code: number;
      message: string;
      data: any;
    }>(`/shopify/plans/${planId}`, {
      method: "PUT",
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
