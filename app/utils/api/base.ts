import { API_BASE_URL, getEncryptedAccessToken, getShopUrl } from "./config";

export class BaseApiClient {
  protected baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  protected async request<T>(
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

    const shopUrl = getShopUrl();
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

      const error = new Error(
        errorData.message || `HTTP error! status: ${response.status}`,
      ) as Error & { statusCode?: number; errorData?: any };
      error.statusCode = response.status;
      error.errorData = errorData;

      throw error;
    }

    return response.json();
  }

  protected async uploadRequest<T>(
    endpoint: string,
    formData: FormData,
    method: string = "PUT",
  ): Promise<T> {
    const encryptedToken = getEncryptedAccessToken();

    if (!encryptedToken) {
      throw new Error("Access token not available");
    }

    const headers: Record<string, string> = {
      Authorization: `Bearer ${encryptedToken}`,
    };

    const shopUrl = getShopUrl();
    if (shopUrl) {
      headers["x-shopify-shop-domain"] = shopUrl;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method,
      headers,
      body: formData,
    });

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
}

export const baseApiClient = new BaseApiClient(API_BASE_URL);
