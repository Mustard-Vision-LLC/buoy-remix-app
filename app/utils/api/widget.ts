import { BaseApiClient } from "./base";
import { API_BASE_URL } from "./config";

class WidgetApi extends BaseApiClient {
  async getWidgetConfig() {
    return this.request<{
      status_code: number;
      message: string;
      data: {
        widgetConfig: any;
      };
    }>("/shopify/widget-configuration", { method: "GET" });
  }

  async updateWidgetConfig(config: Record<string, any>) {
    return this.request<{
      status_code: number;
      message: string;
      data: {
        widgetConfig: any;
      };
    }>("/shopify/widget-configuration", {
      method: "POST",
      body: JSON.stringify(config),
    });
  }

  async getWidgetAppearance() {
    return this.request<{
      status_code: number;
      message: string;
      data: {
        widgetAppearance: any;
      };
    }>("/shopify/widget-appearance", { method: "GET" });
  }

  async updateWidgetAppearance(appearance: Record<string, any>) {
    return this.request<{
      status_code: number;
      message: string;
      data: {
        widgetAppearance: any;
      };
    }>("/shopify/widget-appearance", {
      method: "POST",
      body: JSON.stringify(appearance),
    });
  }
}

export const widgetApi = new WidgetApi(API_BASE_URL);
