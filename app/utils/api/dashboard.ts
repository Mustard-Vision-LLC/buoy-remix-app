import { BaseApiClient } from "./base";
import { API_BASE_URL } from "./config";

type Period = "hourly" | "daily" | "weekly" | "monthly" | "yearly";

class DashboardApi extends BaseApiClient {
  // New API methods matching merchant dashboard
  async getDashboardMetrics(period: Period = "daily") {
    return this.request<{
      status_code: number;
      message: string;
      data: {
        total_engagement: number;
        total_conversions: number;
        conversion_rate: number;
        total_revenue: number;
        avg_time_chats: number;
        assisted_shopping: number;
        coupon_intervention: number;
        total_abandoned_carts: number;
        couponBudgets: number;
      };
    }>(`/shopify/dashboard-metrics?period=${period}`, {
      method: "GET",
    });
  }

  async getCouponBudget(period: Period = "daily") {
    return this.request<{
      status_code: number;
      message: string;
      data: {
        data: {
          labels: string[];
          values: number[];
          percentages: number[];
          colors: string[];
        };
      };
    }>(`/shopify/dashboard-metrics/coupon-budget?period=${period}`, {
      method: "GET",
    });
  }

  async getTotalConversions(period: Period = "daily") {
    return this.request<{
      status_code: number;
      message: string;
      data: Array<{
        date: string;
        value: number;
      }>;
    }>(`/shopify/dashboard-metrics/chart/total-conversions?period=${period}`, {
      method: "GET",
    });
  }

  async getMarketPerformance(period: Period = "daily") {
    return this.request<{
      status_code: number;
      message: string;
      data: Array<{
        date: string;
        revenue: number;
        interventions: number;
      }>;
    }>(`/shopify/dashboard-metrics/chart/market-performance?period=${period}`, {
      method: "GET",
    });
  }

  async getInterventionAnalysis(period: Period = "daily") {
    return this.request<{
      status_code: number;
      message: string;
      data: {
        assistedShopping: number;
        abandonedCart: number;
        windowShopper: number;
      };
    }>(
      `/shopify/dashboard-metrics/chart/intervention-analysis?period=${period}`,
      {
        method: "GET",
      },
    );
  }

  async getStorePerformance(period: Period = "daily") {
    return this.request<{
      status_code: number;
      message: string;
      data: Array<{
        date: string;
        totalEngagement: number;
        totalConversions: number;
      }>;
    }>(`/shopify/dashboard-metrics/chart/store-performance?period=${period}`, {
      method: "GET",
    });
  }

  // Old API methods for backward compatibility
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
