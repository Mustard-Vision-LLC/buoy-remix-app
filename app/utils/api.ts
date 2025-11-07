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

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`❌ API Error (${response.status}):`, errorData);

      // Create error with status code and message
      const error = new Error(
        errorData.message || `HTTP error! status: ${response.status}`,
      ) as Error & { statusCode?: number; errorData?: any };
      error.statusCode = response.status;
      error.errorData = errorData;

      throw error;
    }

    const data = await response.json();

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

  // Analytics endpoints
  async getAnalytics(params?: { filter_param?: string; period?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.filter_param)
      queryParams.append("filter_param", params.filter_param);
    if (params?.period) queryParams.append("period", params.period);

    const query = queryParams.toString();
    return this.request<{
      status_code: number;
      message: string;
      data: any;
    }>(`/shopify/analytics${query ? `?${query}` : ""}`, {
      method: "GET",
    });
  }

  async getDashboardAnalytics(params?: {
    filter_param?: string;
    period?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.filter_param)
      queryParams.append("filter_param", params.filter_param);
    if (params?.period) queryParams.append("period", params.period);

    const query = queryParams.toString();
    return this.request<{
      status_code: number;
      message: string;
      data: {
        analytics: {
          engagements: number;
          total_conversion: number;
          average_time_spent: number;
          total_successful_sales: number;
          total_generated_revenue: string;
          abandoned_cart: number;
          total_assisted_shopping: number;
          total_coupon_intervention: number;
          current_coupon_budget: string;
          available_coupon_budget: string;
          tables?: {
            top_viewed_products: Array<{
              product: { title: string };
              view_count: number;
            }>;
            top_purchased_products: Array<{
              serialNumber: number;
              productName: string;
              revenue: string;
              quantitySold: number;
            }>;
          };
        };
      };
    }>(`/shopify/admin/dashboard/analytics${query ? `?${query}` : ""}`, {
      method: "GET",
    });
  }

  async getDashboardStorePerformance(params?: { period?: string }) {
    const queryParams = new URLSearchParams();
    queryParams.append("filter_param", "STORE_PERFORMANCE");
    if (params?.period) queryParams.append("period", params.period);

    const query = queryParams.toString();
    return this.request<{
      status_code: number;
      message: string;
      conversions: {
        datasets: Array<{ data: number[]; label: string }>;
        labels: string[];
      };
      engagements: {
        datasets: Array<{ data: number[]; label: string }>;
        labels: string[];
      };
    }>(`/shopify/admin/dashboard/analytics${query ? `?${query}` : ""}`, {
      method: "GET",
    });
  }

  async getDashboardConversions(params?: { period?: string }) {
    const queryParams = new URLSearchParams();
    queryParams.append("filter_param", "TOTAL_CONVERSION");
    if (params?.period) queryParams.append("period", params.period);

    const query = queryParams.toString();
    return this.request<{
      status_code: number;
      message: string;
      data: {
        datasets: Array<{ data: number[]; label: string }>;
        labels: string[];
      };
    }>(`/shopify/admin/dashboard/analytics${query ? `?${query}` : ""}`, {
      method: "GET",
    });
  }

  async getDashboardMarketPerformance(params?: { period?: string }) {
    const queryParams = new URLSearchParams();
    queryParams.append("filter_param", "MARKET_PERFORMANCE");
    if (params?.period) queryParams.append("period", params.period);

    const query = queryParams.toString();
    return this.request<{
      status_code: number;
      message: string;
      data: {
        conversions: {
          datasets: Array<{ data: number[]; label: string }>;
          labels: string[];
        };
        engagements: {
          datasets: Array<{ data: number[]; label: string }>;
          labels: string[];
        };
      };
    }>(`/shopify/admin/dashboard/analytics${query ? `?${query}` : ""}`, {
      method: "GET",
    });
  }

  async getPerformance(period: string) {
    return this.request<{
      status_code: number;
      message: string;
      conversions: { datasets: any[]; labels: string[] };
      engagements: { datasets: any[]; labels: string[] };
    }>(`/shopify/analytics?filter_param=STORE_PERFORMANCE&period=${period}`, {
      method: "GET",
    });
  }

  async getRevenue(period: string) {
    return this.request<{
      status_code: number;
      message: string;
      data: { datasets: any[]; labels: string[] };
    }>(`/shopify/analytics?filter_param=REVENUE_FROM_CHAT&period=${period}`, {
      method: "GET",
    });
  }

  // Chat/Customer endpoints
  async getCustomers(pageNumber: number = 1) {
    return this.request<{
      status_code: number;
      message: string;
      data: {
        customerSessions: {
          data: any[];
          current_page: number;
          last_page: number;
        };
      };
    }>(`/shopify/customers?page_number=${pageNumber}`, {
      method: "GET",
    });
  }

  async getCustomerSessions(customerId: string, pageNumber: number = 1) {
    return this.request<{
      status_code: number;
      message: string;
      data: {
        customers: {
          data: any[];
          current_page: number;
          last_page: number;
        };
      };
    }>(`/shopify/customers/${customerId}?page_number=${pageNumber}`, {
      method: "GET",
    });
  }

  async getChatHistory(sessionId: string, pageNumber: number = 1) {
    return this.request<{
      status_code: number;
      message: string;
      data: {
        chatMessages: {
          data: any[];
          current_page: number;
          last_page: number;
        };
      };
    }>(`/shopify/chats/${sessionId}?page_number=${pageNumber}`, {
      method: "GET",
    });
  }

  // Widget endpoints
  async getWidgetConfig() {
    return this.request<{
      status_code: number;
      message: string;
      data: Array<{
        id: string;
        code: string;
        name: string;
        description: string;
        feature_is_enabled: boolean;
      }>;
    }>("/shopify/widget-settings", {
      method: "GET",
    });
  }

  async updateWidgetConfig(
    features: Array<{ uuid: string; is_enabled: boolean }>,
  ) {
    return this.request<{
      status_code: number;
      message: string;
      data: any;
    }>("/shopify/widget-settings", {
      method: "PUT",
      body: JSON.stringify({ feature: features }),
    });
  }

  async getWidgetAppearance() {
    return this.request<{
      status_code: number;
      message: string;
      data: {
        is_customized: boolean;
        theme: string;
        logo_image_file?: string;
        hex_code?: string;
        bubble_color?: string;
      };
    }>("/shopify/widget-settings/config", {
      method: "GET",
    });
  }

  async updateWidgetAppearance(formData: FormData) {
    const encryptedToken = getEncryptedAccessToken();

    if (!encryptedToken) {
      throw new Error("Access token not available");
    }

    const headers: Record<string, string> = {
      Authorization: `Bearer ${encryptedToken}`,
    };

    if (shopUrl) {
      headers["x-shopify-shop-domain"] = shopUrl;
    }

    const response = await fetch(
      `${this.baseURL}/shopify/widget-settings/config`,
      {
        method: "PUT",
        headers,
        body: formData,
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`❌ API Error (${response.status}):`, errorData);

      const error = new Error(
        errorData.message || `HTTP error! status: ${response.status}`,
      ) as Error & { statusCode?: number; errorData?: any };
      error.statusCode = response.status;
      error.errorData = errorData;

      throw error;
    }

    return response.json();
  }

  // Live Chat endpoints
  async getChatRooms() {
    return this.request<{
      status_code: number;
      message: string;
      data: Array<{
        id: number;
        uuid: string;
        created_at: string;
        updated_at: string;
        deleted_at: string | null;
        shop_id: number;
        customer_id: number;
        customer_location: string;
        customer_browser: string;
        status: "ACTIVE" | "CLOSED";
        live_chat_messages: Array<{
          id: number;
          uuid: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          chat_room_id: number;
          sender_id: string;
          sender_type: "CUSTOMER" | "MERCHANT";
          message: string;
          is_read: boolean;
        }>;
      }>;
    }>("/shopify/admin-chat/rooms", {
      method: "GET",
    });
  }

  async getChatMessages(chatRoomId: string, limit?: number) {
    const queryParams = new URLSearchParams();
    if (limit) queryParams.append("limit", limit.toString());

    const query = queryParams.toString();
    return this.request<{
      status_code: number;
      message: string;
      data: Array<{
        id: number;
        uuid: string;
        created_at: string;
        updated_at: string;
        deleted_at: string | null;
        chat_room_id: number;
        sender_id: string;
        sender_type: "CUSTOMER" | "MERCHANT";
        message: string;
        is_read: boolean;
      }>;
    }>(
      `/shopify/admin-chat/rooms/${chatRoomId}/messages${query ? `?${query}` : ""}`,
      {
        method: "GET",
      },
    );
  }

  async markChatMessagesAsRead(chatRoomId: string) {
    return this.request<{
      status_code: number;
      message: string;
      data?: unknown;
    }>(`/shopify/admin-chat/rooms/${chatRoomId}/read`, {
      method: "POST",
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
