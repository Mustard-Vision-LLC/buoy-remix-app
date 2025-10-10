import { useState } from "react";
import {
  BlockStack,
  Card,
  Layout,
  Page,
  Text,
  Button,
  Badge,
  InlineStack,
  Box,
  ProgressBar,
  // DataTable,
  Thumbnail,
  Spinner,
} from "@shopify/polaris";
import ChangePlanModal from "./ChangePlanModal";
import AddCardModal from "./AddCardModal";
import TopUpModal from "./TopUpModal";
import {
  useBillingData,
  useTopUp,
  useAddCard,
  useChangePlan,
} from "../../hooks/useBilling";

export default function BillingPage() {
  const { data: billingData, loading, error, refetch } = useBillingData();
  const { topUp, loading: topUpLoading } = useTopUp();
  const { addCard, loading: addCardLoading } = useAddCard();
  const { changePlan, loading: changePlanLoading } = useChangePlan();

  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [showChangePlanModal, setShowChangePlanModal] = useState(false);

  // Show loading state
  if (loading) {
    return (
      <Page title="Billing">
        <Layout>
          <Layout.Section>
            <Card>
              <div style={{ textAlign: "center", padding: "2rem" }}>
                <Spinner size="large" />
                <Text variant="bodyMd" as="p" tone="subdued">
                  Loading billing data...
                </Text>
              </div>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  // Show error state
  if (error || !billingData) {
    return (
      <Page title="Billing">
        <Layout>
          <Layout.Section>
            <Card>
              <div style={{ textAlign: "center", padding: "2rem" }}>
                <Text variant="bodyMd" as="p" tone="critical">
                  {error || "Failed to load billing data"}
                </Text>
                <Button onClick={refetch}>Retry</Button>
              </div>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  const data = billingData;

  const interactionUsagePercentage = Math.min(
    (data.interactions.total / data.interactions.limit) * 100,
    100,
  );

  // const billingHistoryRows = data.billingHistory.map((item) => [
  //   item.transactionRef,
  //   item.type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
  //   item.date,
  //   <Badge
  //     progress={item.status === "successful" ? "complete" : "incomplete"}
  //     key={item.id}
  //   >
  //     {item.status === "successful" ? "Successful" : "Failed"}
  //   </Badge>,
  //   item.amount,
  // ]);

  return (
    <Page
      title="Billing"
      primaryAction={{
        content: "Add Card",
        onAction: () => setShowAddCardModal(true),
      }}
    >
      <Layout>
        <Layout.Section variant="oneHalf">
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">
                Account Fund
              </Text>
              <Box
                padding="400"
                background="bg-surface-secondary"
                borderRadius="200"
              >
                <BlockStack gap="200">
                  <Text variant="bodyMd" as="p" tone="subdued">
                    Top-up your account balance, add funds for future purchases
                  </Text>
                  <Box background="bg-surface" padding="400" borderRadius="100">
                    <Text variant="heading2xl" as="h3">
                      ${data.balance}
                    </Text>
                  </Box>
                  <Button
                    onClick={() => setShowTopUpModal(true)}
                    variant="secondary"
                  >
                    Top-Up Balance
                  </Button>
                </BlockStack>
              </Box>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section variant="oneHalf">
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">
                Payment Methods
              </Text>
              {data.cards.length > 0 ? (
                <BlockStack gap="300">
                  {data.cards.map((card) => (
                    <Box
                      key={card.id}
                      padding="400"
                      background="bg-surface-secondary"
                      borderRadius="200"
                    >
                      <InlineStack align="space-between">
                        <InlineStack gap="300">
                          <Thumbnail
                            source={`/images/${card.brand.toLowerCase()}.png`}
                            alt={`${card.brand} card`}
                            size="small"
                          />
                          <BlockStack gap="050">
                            <Text variant="bodyMd" as="p" fontWeight="semibold">
                              {card.name}
                            </Text>
                            <Text variant="bodySm" as="p" tone="subdued">
                              **** **** **** {card.last4}
                            </Text>
                            <InlineStack gap="200">
                              <Text variant="bodySm" as="p" tone="subdued">
                                {card.expiry}
                              </Text>
                              {card.isDefault && <Badge>Default</Badge>}
                            </InlineStack>
                          </BlockStack>
                        </InlineStack>
                        <Button size="slim" variant="secondary">
                          Edit
                        </Button>
                      </InlineStack>
                    </Box>
                  ))}
                </BlockStack>
              ) : (
                <Text variant="bodyMd" as="p" tone="subdued">
                  No saved cards
                </Text>
              )}
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">
                Current Plan
              </Text>
              <InlineStack gap="600" wrap={false}>
                <BlockStack gap="300">
                  <Box
                    background="bg-surface-secondary"
                    padding="200"
                    borderRadius="100"
                  >
                    <InlineStack gap="150">
                      <Box
                        background="bg-surface-brand"
                        padding="100"
                        borderRadius="050"
                      >
                        <Text variant="bodyMd" as="p">
                          {data.currentPlan.name}
                        </Text>
                      </Box>
                    </InlineStack>
                  </Box>
                  <Box
                    background="bg-surface-secondary"
                    padding="400"
                    borderRadius="200"
                  >
                    <BlockStack gap="100">
                      <Text variant="heading2xl" as="h3">
                        ${data.currentPlan.costPerToken}
                      </Text>
                      <Text variant="bodySm" as="p" tone="subdued">
                        per token
                      </Text>
                    </BlockStack>
                  </Box>
                </BlockStack>

                <BlockStack gap="300">
                  <Text variant="bodyMd" as="p" fontWeight="semibold">
                    Usage & Limit
                  </Text>
                  <InlineStack gap="400">
                    <BlockStack gap="200">
                      <Box>
                        <ProgressBar
                          progress={interactionUsagePercentage}
                          size="small"
                        />
                      </Box>
                      <Text variant="bodyXs" as="p" fontWeight="semibold">
                        Interactions
                      </Text>
                      <Text variant="bodyXs" as="p" tone="subdued">
                        {data.interactions.total} / {data.interactions.limit}
                      </Text>
                    </BlockStack>

                    <BlockStack gap="200">
                      <Box>
                        <ProgressBar progress={25} size="small" />
                      </Box>
                      <Text variant="bodyXs" as="p" fontWeight="semibold">
                        Connected Stores
                      </Text>
                      <Text variant="bodyXs" as="p" tone="subdued">
                        {data.connectedStores} / unlimited
                      </Text>
                    </BlockStack>

                    <BlockStack gap="200">
                      <Box>
                        <ProgressBar progress={25} size="small" />
                      </Box>
                      <Text variant="bodyXs" as="p" fontWeight="semibold">
                        Users
                      </Text>
                      <Text variant="bodyXs" as="p" tone="subdued">
                        {data.customers} / unlimited
                      </Text>
                    </BlockStack>
                  </InlineStack>
                  {/* <Button
                    onClick={() => setShowChangePlanModal(true)}
                    fullWidth
                  >
                    Upgrade Plan
                  </Button> */}
                </BlockStack>
              </InlineStack>
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text variant="headingMd" as="h2">
                Billing History
              </Text>
              <DataTable
                columnContentTypes={["text", "text", "text", "text", "text"]}
                headings={[
                  "Transaction Ref",
                  "Type",
                  "Date",
                  "Status",
                  "Amount",
                ]}
                rows={billingHistoryRows}
              />
            </BlockStack>
          </Card>
        </Layout.Section> */}
      </Layout>

      {/* Top-up Modal */}
      <TopUpModal
        open={showTopUpModal}
        onClose={() => setShowTopUpModal(false)}
        onSubmit={async (amount) => {
          try {
            await topUp(amount);
            setShowTopUpModal(false);
            refetch(); // Refresh billing data
          } catch (error) {
            console.error("Top-up failed:", error);
          }
        }}
        isLoading={topUpLoading}
      />

      {/* Add Card Modal */}
      <AddCardModal
        open={showAddCardModal}
        onClose={() => setShowAddCardModal(false)}
        onSubmit={async (cardData) => {
          try {
            await addCard(cardData);
            setShowAddCardModal(false);
            refetch(); // Refresh billing data
          } catch (error) {
            console.error("Add card failed:", error);
          }
        }}
        isLoading={addCardLoading}
      />

      {/* Change Plan Modal */}
      <ChangePlanModal
        open={showChangePlanModal}
        onClose={() => setShowChangePlanModal(false)}
        onPlanSelect={async (planId, planName) => {
          try {
            await changePlan(planId, planName);
            setShowChangePlanModal(false);
            refetch(); // Refresh billing data
          } catch (error) {
            console.error("Plan change failed:", error);
          }
        }}
        isLoading={changePlanLoading}
      />
    </Page>
  );
}
