import { useState, useEffect } from "react";
import {
  Card,
  EmptyState,
  TextField,
  BlockStack,
  InlineStack,
  Text,
  Avatar,
  Spinner,
  Button,
  Badge,
} from "@shopify/polaris";
import { apiClient } from "~/utils/api";

interface Customer {
  email: string | null;
  full_name: string;
  customer_id: string;
  avatar: string;
  is_registered: boolean;
  store_type: string;
  joined: string;
}

interface Session {
  date: string;
  time: string;
  session_id: string;
  created_at: string;
}

interface Message {
  content: any;
  sender_type: string;
  sent_at: string;
  message_type: string;
}

export default function ChatsTab() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Fetch customers
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await apiClient.getCustomers(1);
        setCustomers(response.data.customerSessions.data);
      } catch (error) {
        console.error("Error fetching customers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  // Fetch sessions when customer is selected
  useEffect(() => {
    if (!selectedCustomer) return;

    const fetchSessions = async () => {
      setLoadingSessions(true);
      try {
        const response = await apiClient.getCustomerSessions(
          selectedCustomer,
          1,
        );
        const sessionsData = response?.data?.customers?.data.map((s: any) => {
          const date = new Date(s.created_at);
          return {
            date: date.toLocaleDateString("en-US", {
              month: "short",
              day: "2-digit",
              year: "numeric",
            }),
            time: date.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }),
            session_id: s.session_id,
            created_at: s.created_at,
          };
        });
        setSessions(sessionsData);
        if (sessionsData?.length > 0) {
          setSelectedSession(sessionsData[0]?.session_id);
        }
      } catch (error) {
        console.error("Error fetching sessions:", error);
      } finally {
        setLoadingSessions(false);
      }
    };

    fetchSessions();
  }, [selectedCustomer]);

  // Fetch messages when session is selected
  useEffect(() => {
    if (!selectedSession) return;

    const fetchMessages = async () => {
      setLoadingMessages(true);
      try {
        const response = await apiClient.getChatHistory(selectedSession, 1);
        setMessages(response.data.chatMessages.data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [selectedSession]);

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (customer.email &&
        customer.email.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours =
      Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return date.toLocaleDateString();
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatMessageContent = (msg: Message) => {
    if (typeof msg.content === "string") {
      return msg.content;
    } else if (msg.content && typeof msg.content === "object") {
      if (msg.content.instructions) {
        return msg.content.instructions;
      } else if (msg.message_type === "TEXT_ONLY") {
        return "Bot response";
      } else {
        return JSON.stringify(msg.content);
      }
    }
    return "";
  };

  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: "center", padding: "40px" }}>
          <Spinner size="large" />
        </div>
      </Card>
    );
  }

  if (customers.length === 0) {
    return (
      <Card>
        <EmptyState
          heading="No chat conversations yet"
          image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
        >
          <p>Chat conversations with customers will appear here.</p>
        </EmptyState>
      </Card>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "300px 1fr",
        gap: "16px",
        minHeight: "600px",
      }}
    >
      {/* Customer List */}
      <Card>
        <BlockStack gap="400">
          <Text variant="headingMd" as="h3">
            Users
          </Text>
          <TextField
            label=""
            labelHidden
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search users..."
            autoComplete="off"
          />
          <div style={{ maxHeight: "500px", overflow: "auto" }}>
            <BlockStack gap="200">
              {filteredCustomers.map((customer) => (
                <div
                  key={customer.customer_id}
                  onClick={() => setSelectedCustomer(customer.customer_id)}
                  style={{
                    padding: "12px",
                    cursor: "pointer",
                    backgroundColor:
                      selectedCustomer === customer.customer_id
                        ? "#f3f4f6"
                        : "transparent",
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <InlineStack gap="300" blockAlign="start">
                    <Avatar
                      customer
                      name={customer.full_name}
                      initials={getInitials(customer.full_name)}
                    />
                    <BlockStack gap="100">
                      <InlineStack gap="200" blockAlign="center">
                        <Text variant="bodyMd" as="p" fontWeight="semibold">
                          {customer.full_name}
                        </Text>
                        {customer.is_registered && (
                          <Badge tone="success">Active</Badge>
                        )}
                      </InlineStack>
                      <Text variant="bodySm" as="p" tone="subdued">
                        {customer.email || "Guest"} •{" "}
                        {formatTimestamp(customer.joined)}
                      </Text>
                    </BlockStack>
                  </InlineStack>
                </div>
              ))}
            </BlockStack>
          </div>
        </BlockStack>
      </Card>

      {/* Chat Area */}
      <Card>
        {!selectedCustomer ? (
          <EmptyState heading="Select a customer to view chat" image="">
            <p>Choose a customer from the list to see their chat sessions.</p>
          </EmptyState>
        ) : (
          <BlockStack gap="400">
            {/* Sessions */}
            {loadingSessions ? (
              <div style={{ textAlign: "center", padding: "20px" }}>
                <Spinner size="small" />
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  overflowX: "auto",
                  padding: "8px 0",
                }}
              >
                {sessions.map((session) => (
                  <Button
                    key={session.session_id}
                    onClick={() => setSelectedSession(session.session_id)}
                    variant={
                      selectedSession === session.session_id
                        ? "primary"
                        : "secondary"
                    }
                    size="slim"
                  >
                    {session.date} {session.time}
                  </Button>
                ))}
              </div>
            )}

            {/* Messages */}
            {loadingMessages ? (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <Spinner size="large" />
              </div>
            ) : selectedSession ? (
              <div
                style={{
                  maxHeight: "450px",
                  overflow: "auto",
                  padding: "16px",
                }}
              >
                <BlockStack gap="300">
                  {messages.map((msg, index) => {
                    const isBot = msg.sender_type === "BOT";
                    const content = formatMessageContent(msg);

                    return (
                      <div
                        key={index}
                        style={{
                          display: "flex",
                          justifyContent: isBot ? "flex-start" : "flex-end",
                        }}
                      >
                        <div
                          style={{
                            maxWidth: "80%",
                            padding: "12px",
                            borderRadius: "8px",
                            backgroundColor: isBot ? "#ff5b00" : "#e5e7eb",
                            color: isBot ? "white" : "black",
                          }}
                        >
                          <Text
                            variant="bodySm"
                            as="p"
                            tone={isBot ? undefined : "subdued"}
                          >
                            {formatTimestamp(msg.sent_at)}
                          </Text>
                          <Text variant="bodyMd" as="p">
                            {content}
                          </Text>
                          <Text
                            variant="bodySm"
                            as="p"
                            tone={isBot ? undefined : "subdued"}
                          >
                            {isBot ? "Bot" : "User"}
                          </Text>
                        </div>
                      </div>
                    );
                  })}
                </BlockStack>
              </div>
            ) : (
              <EmptyState heading="Select a session to view messages" image="">
                <p>Choose a session from above to see the conversation.</p>
              </EmptyState>
            )}
          </BlockStack>
        )}
      </Card>
    </div>
  );
}
