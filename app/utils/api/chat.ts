import { BaseApiClient } from "./base";
import { API_BASE_URL } from "./config";

class ChatApi extends BaseApiClient {
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

export const chatApi = new ChatApi(API_BASE_URL);
