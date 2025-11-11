import { BaseApiClient } from "./base";
import { API_BASE_URL } from "./config";

class CustomersApi extends BaseApiClient {
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
    }>(`/shopify/customers?page_number=${pageNumber}`, { method: "GET" });
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
}

export const customersApi = new CustomersApi(API_BASE_URL);
