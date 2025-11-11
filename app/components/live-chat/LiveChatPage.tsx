import { useState, useCallback, useRef, useEffect } from "react";
import { useLoaderData } from "@remix-run/react";
import {
  Page,
  Card,
  BlockStack,
  InlineStack,
  Text,
  TextField,
  Button,
  Avatar,
  Scrollable,
  Badge,
  EmptyState,
  Divider,
} from "@shopify/polaris";
import { apiClient, setAccessToken, setShopUrl } from "~/utils/api";
import { useLiveChatSocket } from "~/hooks/useLiveChatSocket";

interface ChatMessage {
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
}

interface ChatRoom {
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
  live_chat_messages: ChatMessage[];
}

interface ChatListItemProps {
  chat: {
    id: string;
    customerName: string;
    lastMessage: string;
    timestamp: string;
    isOnline: boolean;
    unreadCount: number;
  };
  isSelected: boolean;
  onClick: () => void;
}

const ChatListItem: React.FC<ChatListItemProps> = ({
  chat,
  isSelected,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      style={{
        padding: "12px",
        cursor: "pointer",
        backgroundColor: isSelected ? "#f1f2f4" : "transparent",
        borderRadius: "8px",
      }}
    >
      <InlineStack align="space-between" blockAlign="start">
        <InlineStack gap="300" blockAlign="center">
          <div style={{ position: "relative" }}>
            <Avatar customer name={chat.customerName} />
            {chat.isOnline && (
              <div
                style={{
                  position: "absolute",
                  bottom: "0",
                  right: "0",
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  backgroundColor: "#50b83c",
                  border: "2px solid white",
                }}
              />
            )}
          </div>
          <BlockStack gap="100">
            <InlineStack gap="200" blockAlign="center">
              <Text as="span" variant="bodyMd" fontWeight="semibold">
                {chat.customerName}
              </Text>
              {chat.unreadCount > 0 && (
                <Badge tone="attention">{chat.unreadCount.toString()}</Badge>
              )}
            </InlineStack>
            <Text as="p" variant="bodySm" tone="subdued" truncate>
              {chat.lastMessage}
            </Text>
          </BlockStack>
        </InlineStack>
        <Text as="span" variant="bodySm" tone="subdued">
          {chat.timestamp}
        </Text>
      </InlineStack>
    </div>
  );
};

interface ChatListProps {
  chatRooms: ChatRoom[];
  selectedChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onRefresh: () => void;
}

const ChatsList: React.FC<ChatListProps> = ({
  chatRooms,
  selectedChatId,
  onSelectChat,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  // Transform chat rooms to match the expected format
  const chats = chatRooms.map((room) => {
    const lastMessage =
      room.live_chat_messages.length > 0
        ? room.live_chat_messages[room.live_chat_messages.length - 1].message
        : "No messages yet";
    const timestamp =
      room.live_chat_messages.length > 0
        ? new Date(
            room.live_chat_messages[
              room.live_chat_messages.length - 1
            ].created_at,
          ).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        : new Date(room.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });
    const unreadCount = room.live_chat_messages.filter(
      (msg) => !msg.is_read && msg.sender_type === "CUSTOMER",
    ).length;

    return {
      id: room.uuid,
      customerName: `Customer ${room.customer_id}`,
      lastMessage,
      timestamp,
      isOnline: room.status === "ACTIVE",
      unreadCount,
    };
  });

  const filteredChats = chats.filter((chat) =>
    chat.customerName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <BlockStack gap="300">
      <TextField
        label=""
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search conversations..."
        autoComplete="off"
        clearButton
        onClearButtonClick={() => setSearchQuery("")}
      />

      <Scrollable shadow style={{ height: "520px" }}>
        <BlockStack gap="100">
          {filteredChats.length === 0 ? (
            <div style={{ padding: "20px", textAlign: "center" }}>
              <Text as="p" variant="bodyMd" tone="subdued">
                {searchQuery
                  ? "No conversations found"
                  : "No conversations available"}
              </Text>
            </div>
          ) : (
            filteredChats.map((chat) => (
              <div key={chat.id}>
                <ChatListItem
                  chat={chat}
                  isSelected={selectedChatId === chat.id}
                  onClick={() => onSelectChat(chat.id)}
                />
                <Divider />
              </div>
            ))
          )}
        </BlockStack>
      </Scrollable>
    </BlockStack>
  );
};

interface ChatSessionViewProps {
  selectedChatId: string | null;
  accessToken: string;
  shopUrl: string;
}

const ChatSessionView: React.FC<ChatSessionViewProps> = ({
  selectedChatId,
  accessToken,
  shopUrl,
}) => {
  const [inputMessage, setInputMessage] = useState("");
  const [initialMessages, setInitialMessages] = useState<ChatMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize socket connection
  const {
    messages: socketMessages,
    isConnected,
    isTyping,
    error,
    sendMessage,
    handleTyping,
    clearMessages,
  } = useLiveChatSocket({
    chatRoomId: selectedChatId,
    enabled: !!selectedChatId,
    accessToken,
    shopUrl,
  });

  // Fetch initial messages
  useEffect(() => {
    if (selectedChatId) {
      setIsLoadingMessages(true);
      apiClient
        .getChatMessages(selectedChatId, 50)
        .then((response) => {
          setInitialMessages(response.data || []);
        })
        .catch((err) => {
          console.error("Error fetching messages:", err);
        })
        .finally(() => {
          setIsLoadingMessages(false);
        });
    }
  }, [selectedChatId]);

  // Combine initial messages with socket messages
  const allMessages = [...initialMessages, ...socketMessages];

  // Remove duplicates based on message ID
  const uniqueMessages = allMessages.filter(
    (msg, index, self) => index === self.findIndex((m) => m.id === msg.id),
  );

  // Sort messages by created_at
  const sortedMessages = uniqueMessages.sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [sortedMessages, isTyping]);

  useEffect(() => {
    clearMessages();
    setInitialMessages([]);
  }, [selectedChatId, clearMessages]);

  // Mark messages as read
  useEffect(() => {
    if (selectedChatId && !isLoadingMessages && sortedMessages.length > 0) {
      apiClient
        .markChatMessagesAsRead(selectedChatId)
        .then(() => {
          console.log("Messages marked as read");
        })
        .catch((err) => {
          console.error("Error marking messages as read:", err);
        });
    }
  }, [selectedChatId, isLoadingMessages, sortedMessages.length]);

  const handleSendMessage = useCallback(() => {
    if (inputMessage.trim() && isConnected) {
      sendMessage(inputMessage.trim());
      setInputMessage("");
    }
  }, [inputMessage, isConnected, sendMessage]);

  const handleInputChange = useCallback(
    (value: string) => {
      setInputMessage(value);
      handleTyping();
    },
    [handleTyping],
  );

  if (!selectedChatId) {
    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <EmptyState
          heading="Select a conversation"
          image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
        >
          <p>Choose a customer conversation from the list to start chatting</p>
        </EmptyState>
      </div>
    );
  }

  return (
    <BlockStack gap="0">
      {/* Chat Header */}
      <div
        style={{
          padding: "16px",
          borderBottom: "1px solid #e1e3e5",
        }}
      >
        <InlineStack align="space-between" blockAlign="center">
          <Text as="h3" variant="headingSm">
            Chat with Customer
          </Text>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {isConnected ? (
              <>
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: "#50b83c",
                  }}
                />
                <Text as="span" variant="bodySm" tone="subdued">
                  Connected
                </Text>
              </>
            ) : (
              <>
                <div
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: "#999",
                  }}
                />
                <Text as="span" variant="bodySm" tone="subdued">
                  Connecting...
                </Text>
              </>
            )}
          </div>
        </InlineStack>
        {error && (
          <div
            style={{
              marginTop: "8px",
              padding: "8px",
              backgroundColor: "#fee",
              borderRadius: "4px",
            }}
          >
            <Text as="p" variant="bodySm" tone="critical">
              Error: {error}
            </Text>
          </div>
        )}
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        style={{
          height: "450px",
          overflowY: "auto",
          padding: "16px",
          backgroundColor: "#fafbfb",
        }}
      >
        {isLoadingMessages ? (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <Text as="p" variant="bodyMd" tone="subdued">
              Loading messages...
            </Text>
          </div>
        ) : sortedMessages.length === 0 ? (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <Text as="p" variant="bodyMd" tone="subdued">
              No messages yet. Start the conversation!
            </Text>
          </div>
        ) : (
          <BlockStack gap="300">
            {sortedMessages.map((message) => (
              <div
                key={message.id}
                style={{
                  display: "flex",
                  justifyContent:
                    message.sender_type === "MERCHANT"
                      ? "flex-end"
                      : "flex-start",
                }}
              >
                <div
                  style={{
                    maxWidth: "70%",
                    padding: "12px 16px",
                    borderRadius: "12px",
                    backgroundColor:
                      message.sender_type === "MERCHANT"
                        ? "#005bd3"
                        : "#ffffff",
                    color:
                      message.sender_type === "MERCHANT"
                        ? "#ffffff"
                        : "#202223",
                  }}
                >
                  <Text as="p" variant="bodyMd">
                    {message.message}
                  </Text>
                  <Text as="p" variant="bodySm" tone="subdued">
                    {new Date(message.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div
                  style={{
                    padding: "12px 16px",
                    borderRadius: "12px",
                    backgroundColor: "#ffffff",
                  }}
                >
                  <Text as="p" variant="bodyMd" tone="subdued">
                    Customer is typing...
                  </Text>
                </div>
              </div>
            )}
          </BlockStack>
        )}
      </div>

      {/* Message Input */}
      <div
        style={{
          padding: "16px",
          borderTop: "1px solid #e1e3e5",
        }}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (isConnected && inputMessage.trim()) {
              handleSendMessage();
            }
          }}
        >
          <InlineStack gap="200">
            <div style={{ flex: 1 }}>
              <TextField
                label=""
                value={inputMessage}
                onChange={handleInputChange}
                placeholder="Type your message..."
                autoComplete="off"
                disabled={!isConnected}
              />
            </div>
            <Button
              variant="primary"
              submit
              disabled={!isConnected || !inputMessage.trim()}
            >
              Send
            </Button>
          </InlineStack>
        </form>
      </div>
    </BlockStack>
  );
};

export default function LiveChatPage() {
  const {
    shop,
    accessToken,
    chatRooms: initialChatRooms,
  } = useLoaderData<{
    shop: string;
    accessToken: string;
    chatRooms: ChatRoom[];
  }>();

  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>(initialChatRooms);

  // Set access token and shop URL for API client in the browser
  useEffect(() => {
    if (accessToken && shop) {
      setAccessToken(accessToken);
      setShopUrl(shop);
    }
  }, [accessToken, shop]);

  // Auto-refresh chat rooms every 10 seconds
  useEffect(() => {
    apiClient.getChatRooms().then((response) => {
      if (response.data) {
        setChatRooms(response.data);
      }
    });

    const interval = setInterval(() => {
      apiClient.getChatRooms().then((response) => {
        if (response.data) {
          setChatRooms(response.data);
        }
      });
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleChatSelect = useCallback((chatId: string) => {
    setSelectedChatId(chatId);
  }, []);

  const handleRefresh = useCallback(() => {
    apiClient.getChatRooms().then((response) => {
      if (response.data) {
        setChatRooms(response.data);
      }
    });
  }, []);

  if (chatRooms.length === 0) {
    return (
      <Page
        title="Live Chat"
        subtitle="Manage customer conversations in real-time"
      >
        <Card>
          <div style={{ padding: "16px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "500px",
              }}
            >
              <EmptyState
                heading="No conversations yet"
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
              >
                <p>
                  When customers start chatting, their conversations will appear
                  here.
                </p>
              </EmptyState>
            </div>
          </div>
        </Card>
      </Page>
    );
  }

  return (
    <Page
      title="Live Chat"
      subtitle="Manage customer conversations in real-time"
    >
      <Card>
        <div style={{ padding: "16px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "350px 1fr",
              gap: "16px",
              height: "600px",
            }}
          >
            {/* Chat List Panel */}
            <Card>
              <ChatsList
                chatRooms={chatRooms}
                selectedChatId={selectedChatId}
                onSelectChat={handleChatSelect}
                onRefresh={handleRefresh}
              />
            </Card>

            {/* Chat Messages Panel */}
            <Card>
              <ChatSessionView
                selectedChatId={selectedChatId}
                accessToken={accessToken}
                shopUrl={shop}
              />
            </Card>
          </div>
        </div>
      </Card>
    </Page>
  );
}
