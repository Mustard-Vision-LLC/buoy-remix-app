import { useState } from "react";
import { useLoaderData, useRevalidator } from "@remix-run/react";
import {
  BlockStack,
  Card,
  Layout,
  Page,
  Text,
  Button,
  InlineStack,
  Box,
  ProgressBar,
} from "@shopify/polaris";
import ChangePlanModal from "./ChangePlanModal";
import TopUpModal from "./TopUpModal";

export default function BillingPage() {
  const loaderData = useLoaderData<{
    shop: string;
    billingData: any;
    error?: string;
  }>();
  const { revalidate } = useRevalidator();

  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [showChangePlanModal, setShowChangePlanModal] = useState(false);
  const [topUpLoading, setTopUpLoading] = useState(false);
  const [changePlanLoading, setChangePlanLoading] = useState(false);

  // Show error state
  if (loaderData.error || !loaderData.billingData) {
    return (
      <Page title="Billing">
        <Layout>
          <Layout.Section>
            <Card>
              <div style={{ textAlign: "center", padding: "2rem" }}>
                <Text variant="bodyMd" as="p" tone="critical">
                  {loaderData.error || "Failed to load billing data"}
                </Text>
                <Button onClick={() => revalidate()}>Retry</Button>
              </div>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  const data = loaderData.billingData;

  const interactionUsagePercentage = Math.min(
    (data.interactions.total / data.interactions.limit) * 100,
    100,
  );

  return (
    <Page title="Billing">
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
                        {data.connectedStores.active} active /{" "}
                        {data.connectedStores.total} total
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
                  <Button
                    onClick={() => setShowChangePlanModal(true)}
                    fullWidth
                  >
                    Upgrade Plan
                  </Button>
                </BlockStack>
              </InlineStack>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>

      {/* Top-up Modal */}
      <TopUpModal
        open={showTopUpModal}
        onClose={() => setShowTopUpModal(false)}
        onSubmit={async (amount) => {
          try {
            setTopUpLoading(true);
            const response = await fetch("/app/billing", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ amount }),
            });
            if (!response.ok) throw new Error("Top-up failed");
            setShowTopUpModal(false);
            revalidate(); // Refresh billing data
          } catch (error) {
            console.error("Top-up failed:", error);
          } finally {
            setTopUpLoading(false);
          }
        }}
        isLoading={topUpLoading}
      />

      {/* Change Plan Modal */}
      <ChangePlanModal
        open={showChangePlanModal}
        onClose={() => setShowChangePlanModal(false)}
        onPlanSelect={async (planId, planName) => {
          try {
            setChangePlanLoading(true);
            // TODO: Implement when backend endpoint is available
            console.log("Change plan:", planId, planName);
            setShowChangePlanModal(false);
            revalidate(); // Refresh billing data
          } catch (error) {
            console.error("Plan change failed:", error);
          } finally {
            setChangePlanLoading(false);
          }
        }}
        isLoading={changePlanLoading}
      />
    </Page>
  );
}
