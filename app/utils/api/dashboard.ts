import { BaseApiClient } from "./base";
import { API_BASE_URL } from "./config";

class DashboardApi extends BaseApiClient {
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
    }>(`/shopify/analytics${query ? `?${query}` : ""}`, { method: "GET" });
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
}

export const dashboardApi = new DashboardApi(API_BASE_URL);
