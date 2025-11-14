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
    }>("/shopify/widget-settings", { method: "GET" });
  }

  async updateWidgetConfig(config: Record<string, any>) {
    return this.request<{
      status_code: number;
      message: string;
      data: {
        widgetConfig: any;
      };
    }>("/shopify/widget-settings", {
      method: "PUT",
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
    }>("/shopify/widget-settings/config", { method: "GET" });
  }

  async updateWidgetAppearance(appearance: FormData | Record<string, any>) {
    // If appearance is FormData, use uploadRequest
    if (appearance instanceof FormData) {
      return this.uploadRequest<{
        status_code: number;
        message: string;
        data: {
          widgetAppearance: any;
        };
      }>("/shopify/widget-settings/config", appearance, "PUT");
    }

    // Otherwise, use regular request with JSON
    return this.request<{
      status_code: number;
      message: string;
      data: {
        widgetAppearance: any;
      };
    }>("/shopify/widget-settings/config", {
      method: "PUT",
      body: JSON.stringify(appearance),
    });
  }
}

export const widgetApi = new WidgetApi(API_BASE_URL);
