import { useEffect, useRef, useState, useCallback } from "react";
import { io, type Socket } from "socket.io-client";
import { encryptAccessToken } from "~/utils/api";

export interface LiveChatMessage {
  id: number;
  uuid: string;
  chat_room_id: number;
  sender_id: string;
  sender_type: "CUSTOMER" | "MERCHANT";
  message: string;
  is_read: boolean;
  created_at: string;
}

interface UseLiveChatSocketProps {
  chatRoomId: string | null;
  enabled?: boolean;
}

interface UseLiveChatSocketPropsExtended extends UseLiveChatSocketProps {
  accessToken: string;
  shopUrl?: string;
}

export const useLiveChatSocket = ({
  chatRoomId,
  enabled = true,
  accessToken,
  shopUrl,
}: UseLiveChatSocketPropsExtended) => {
  const [messages, setMessages] = useState<LiveChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  const socketUrl = "https://dashboard-api.fishook.online";

  useEffect(() => {
    if (!enabled || !accessToken) {
      return;
    }

    const encryptedToken = encryptAccessToken(accessToken);

    // Initialize socket connection with headers
    const socket = io(`${socketUrl}/live-chat`, {
      auth: {
        authorization_token: encryptedToken,
      },
      extraHeaders: {
        ...(shopUrl && { "x-shopify-shop-domain": shopUrl }),
      },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      setError(null);

      // Emit user:join event
      socket.emit("user:join");

      // Join chat room if chatRoomId is available
      if (chatRoomId) {
        socket.emit("chat:join", { chat_room_id: chatRoomId });
      }
    });

    socket.on("chat:user_joined", () => {
      console.log("User joined chat successfully");
    });

    socket.on("chat:join_error", (data: { error: string }) => {
      console.error("Error joining chat:", data.error);
      setError(data.error);
    });

    socket.on(
      "message:received",
      (data: LiveChatMessage & { chat_room_id: number }) => {
        setMessages((prev) => [...prev, data]);

        // Mark messages as read
        socket.emit("messages:read", { chat_room_id: data.chat_room_id });
      },
    );

    socket.on("message:sent", (data: { message_id: number }) => {
      console.log("Message sent successfully:", data.message_id);
    });

    socket.on("message:error", (data: { error: string }) => {
      console.error("Message error:", data.error);
      setError(data.error);
    });

    socket.on("user:typing", () => {
      setIsTyping(true);
    });

    socket.on("user:stopped-typing", () => {
      setIsTyping(false);
    });

    socket.on("messages:read", () => {
      // Update message read status in UI if needed
      console.log("Messages marked as read");
    });

    socket.on("messages:read_error", (data: { error: string }) => {
      console.error("Messages read error:", data.error);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
      setIsConnected(false);
    });

    socket.on("connect_error", (err: Error) => {
      console.error("Connection error:", err.message);
      setError(err.message);
      setIsConnected(false);
    });

    socket.on("error", (err: string) => {
      console.error("Socket error:", err);
      setError(err);
    });

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      socket.disconnect();
    };
  }, [enabled, chatRoomId, accessToken, shopUrl]);

  // Join a specific chat room
  const joinChatRoom = useCallback(
    (roomId: string) => {
      if (socketRef.current && isConnected) {
        socketRef.current.emit("chat:join", { chat_room_id: roomId });
      }
    },
    [isConnected],
  );

  // Send a message
  const sendMessage = useCallback(
    (message: string) => {
      if (socketRef.current && isConnected && chatRoomId) {
        socketRef.current.emit("message:send", {
          chat_room_id: chatRoomId,
          sender_type: "MERCHANT",
          message: message,
        });

        // Stop typing indicator
        socketRef.current.emit("typing:stop", { chat_room_id: chatRoomId });
        isTypingRef.current = false;
      }
    },
    [isConnected, chatRoomId],
  );

  // Handle typing indicator
  const handleTyping = useCallback(() => {
    if (socketRef.current && isConnected && chatRoomId) {
      if (!isTypingRef.current) {
        isTypingRef.current = true;
        socketRef.current.emit("typing:start", {
          chat_room_id: chatRoomId,
          username: "Merchant",
        });
      }

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set timeout to stop typing after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        if (socketRef.current && isConnected && chatRoomId) {
          socketRef.current.emit("typing:stop", { chat_room_id: chatRoomId });
          isTypingRef.current = false;
        }
      }, 2000);
    }
  }, [isConnected, chatRoomId]);

  // Clear messages
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isConnected,
    isTyping,
    error,
    sendMessage,
    joinChatRoom,
    handleTyping,
    clearMessages,
  };
};
