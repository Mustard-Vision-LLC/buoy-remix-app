import { useState, useCallback, useRef, useEffect } from "react";
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

interface ChatMessage {
  id: string;
  sender: "customer" | "merchant";
  message: string;
  timestamp: string;
  customerName?: string;
}

interface ChatRoom {
  id: string;
  customerName: string;
  customerEmail: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isOnline: boolean;
}

export default function LiveChatPage() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleChatSelect = useCallback((chatId: string) => {
    setSelectedChat(chatId);
    // Mark messages as read
    setChatRooms((prev) =>
      prev.map((room) =>
        room.id === chatId ? { ...room, unreadCount: 0 } : room,
      ),
    );
  }, []);

  const handleSendMessage = useCallback(() => {
    if (!messageInput.trim() || !selectedChat) return;

    const newMessage: ChatMessage = {
      id: `m${Date.now()}`,
      sender: "merchant",
      message: messageInput,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => ({
      ...prev,
      [selectedChat]: [...(prev[selectedChat] || []), newMessage],
    }));

    setMessageInput("");
  }, [messageInput, selectedChat]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, selectedChat]);

  const filteredChatRooms = chatRooms.filter(
    (room) =>
      room.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <Page
      title="Live Chat"
      subtitle="Manage customer conversations in real-time"
    >
      <Card>
        <div style={{ padding: "16px" }}>
          {/* Empty State - No Data */}
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

          {/* This is the full UI structure that will be activated when API is ready */}
          {false && (
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
                    <BlockStack gap="200">
                      {filteredChatRooms.length === 0 ? (
                        <div style={{ padding: "20px", textAlign: "center" }}>
                          <Text as="p" variant="bodyMd" tone="subdued">
                            No conversations found
                          </Text>
                        </div>
                      ) : (
                        filteredChatRooms.map((room) => (
                          <div key={room.id}>
                            <div
                              onClick={() => handleChatSelect(room.id)}
                              style={{
                                padding: "12px",
                                cursor: "pointer",
                                backgroundColor:
                                  selectedChat === room.id
                                    ? "#f6f6f7"
                                    : "transparent",
                                borderRadius: "8px",
                              }}
                            >
                              <InlineStack
                                align="space-between"
                                blockAlign="start"
                              >
                                <InlineStack gap="300" blockAlign="center">
                                  <div style={{ position: "relative" }}>
                                    <Avatar customer name={room.customerName} />
                                    {room.isOnline && (
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
                                    <Text
                                      as="span"
                                      variant="bodyMd"
                                      fontWeight="semibold"
                                    >
                                      {room.customerName}
                                    </Text>
                                    <Text
                                      as="p"
                                      variant="bodySm"
                                      tone="subdued"
                                      truncate
                                    >
                                      {room.lastMessage}
                                    </Text>
                                  </BlockStack>
                                </InlineStack>
                                <BlockStack gap="100" align="end">
                                  <Text
                                    as="span"
                                    variant="bodySm"
                                    tone="subdued"
                                  >
                                    {room.timestamp}
                                  </Text>
                                  {room.unreadCount > 0 && (
                                    <Badge tone="attention">
                                      {room.unreadCount.toString()}
                                    </Badge>
                                  )}
                                </BlockStack>
                              </InlineStack>
                            </div>
                            <Divider />
                          </div>
                        ))
                      )}
                    </BlockStack>
                  </Scrollable>
                </BlockStack>
              </Card>

              {/* Chat Messages Panel */}
              <Card>
                {selectedChat ? (
                  <BlockStack gap="0">
                    {/* Chat Header */}
                    <div
                      style={{
                        padding: "16px",
                        borderBottom: "1px solid #e1e3e5",
                      }}
                    >
                      <InlineStack gap="300" blockAlign="center">
                        <Avatar
                          customer
                          name={
                            chatRooms.find((r) => r.id === selectedChat)
                              ?.customerName || ""
                          }
                        />
                        <BlockStack gap="100">
                          <Text as="h3" variant="headingSm">
                            {
                              chatRooms.find((r) => r.id === selectedChat)
                                ?.customerName
                            }
                          </Text>
                          <Text as="p" variant="bodySm" tone="subdued">
                            {
                              chatRooms.find((r) => r.id === selectedChat)
                                ?.customerEmail
                            }
                          </Text>
                        </BlockStack>
                        {chatRooms.find((r) => r.id === selectedChat)
                          ?.isOnline && <Badge tone="success">Online</Badge>}
                      </InlineStack>
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
                      <BlockStack gap="300">
                        {(messages[selectedChat!] || []).map(
                          (msg: ChatMessage) => (
                            <div
                              key={msg.id}
                              style={{
                                display: "flex",
                                justifyContent:
                                  msg.sender === "merchant"
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
                                    msg.sender === "merchant"
                                      ? "#005bd3"
                                      : "#ffffff",
                                  color:
                                    msg.sender === "merchant"
                                      ? "#ffffff"
                                      : "#202223",
                                }}
                              >
                                <Text
                                  as="p"
                                  variant="bodyMd"
                                  tone={
                                    msg.sender === "merchant"
                                      ? undefined
                                      : "base"
                                  }
                                >
                                  {msg.message}
                                </Text>
                                <Text
                                  as="p"
                                  variant="bodySm"
                                  tone={
                                    msg.sender === "merchant"
                                      ? "subdued"
                                      : "subdued"
                                  }
                                >
                                  {msg.timestamp}
                                </Text>
                              </div>
                            </div>
                          ),
                        )}
                      </BlockStack>
                    </div>

                    {/* Message Input */}
                    <div
                      style={{
                        padding: "16px",
                        borderTop: "1px solid #e1e3e5",
                      }}
                    >
                      <InlineStack gap="200">
                        <div style={{ flex: 1 }}>
                          <TextField
                            label=""
                            value={messageInput}
                            onChange={setMessageInput}
                            placeholder="Type your message..."
                            autoComplete="off"
                          />
                        </div>
                        <Button variant="primary" onClick={handleSendMessage}>
                          Send
                        </Button>
                      </InlineStack>
                    </div>
                  </BlockStack>
                ) : (
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
                      <p>
                        Choose a customer conversation from the list to start
                        chatting
                      </p>
                    </EmptyState>
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>
      </Card>
    </Page>
  );
}
