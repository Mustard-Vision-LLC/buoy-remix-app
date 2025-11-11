import { BaseApiClient } from "./base";
import { API_BASE_URL } from "./config";

class BillingApi extends BaseApiClient {
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
    }>("/shopify/admin/billings/interactions", { method: "GET" });
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
    }>("/shopify/plans", { method: "GET" });
  }

  async upgradePlan(planId: string) {
    return this.request<{
      status_code: number;
      message: string;
      data: any;
    }>(`/shopify/plans/${planId}`, { method: "PUT" });
  }
}

export const billingApi = new BillingApi(API_BASE_URL);
