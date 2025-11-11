import { BaseApiClient } from "./base";
import { API_BASE_URL } from "./config";

class ProfileApi extends BaseApiClient {
  async getProfile() {
    return this.request<{
      status_code: number;
      message: string;
      data: {
        first_name: string;
        last_name: string;
        email: string;
        phone: string;
        company_name: string;
        profile_image: string;
        id: string;
        registered: string;
        referral_code: string | null;
        user_status: string;
        referrer: string | null;
      };
    }>("/shopify/admin/profile", { method: "GET" });
  }

  async updateProfile(formData: FormData) {
    return this.uploadRequest<{
      status_code: number;
      message: string;
      data: any;
    }>("/shopify/admin/profile", formData, "PUT");
  }

  async changePassword(payload: {
    old_password: string;
    new_password: string;
  }) {
    return this.request<{
      status_code: number;
      message: string;
      data?: unknown;
    }>("/shopify/admin/profile/change-password", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  }
}

export const profileApi = new ProfileApi(API_BASE_URL);
