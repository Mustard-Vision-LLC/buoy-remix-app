import { useState, useEffect } from "react";
import { useLoaderData } from "@remix-run/react";
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
  Spinner,
} from "@shopify/polaris";
import CryptoJS from "crypto-js";
import ChangePlanModal from "./ChangePlanModal";
import TopUpModal from "./TopUpModal";
import {
  useBillingData,
  useTopUp,
  useChangePlan,
} from "../../hooks/useBilling";
import { setAccessToken } from "../../utils/api";

export default function BillingPage() {
  const loaderData = useLoaderData<{
    shop: string;
    accessToken?: string;
    error?: string;
  }>();

  // Set access token when loader data is received
  useEffect(() => {
    if (loaderData.accessToken) {
      setAccessToken(loaderData.accessToken);
      console.log("🔑 Access token received from loader");
    }
  }, [loaderData.accessToken]);

  // Crypto-js sample - runs once on mount
  useEffect(() => {
    const secretKey =
      "$2a$10$YqnDG0Fu5.MdXVBlm9gRI.D75C0$YqnDG0Fu5.$10$YqnDG0Fu5.MdXVBlm9gR-i8cbLojkjfyba-.D75CQQvBU0.pGyrfGdFXAEAHrcLq3Tsa";

    const originalText = "Hello, this is a secret message!";
    console.log("📝 Original Text:", originalText);

    const encrypted = CryptoJS.AES.encrypt(originalText, secretKey).toString();
    console.log("🔒 Encrypted:", encrypted);

    const decrypted = CryptoJS.AES.decrypt(encrypted, secretKey).toString(
      CryptoJS.enc.Utf8,
    );
    console.log("🔓 Decrypted:", decrypted);
  }, []);

  const { data: billingData, loading, error, refetch } = useBillingData();
  const { topUp, loading: topUpLoading } = useTopUp();
  const { changePlan, loading: changePlanLoading } = useChangePlan();

  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [showChangePlanModal, setShowChangePlanModal] = useState(false);

  // Show loader error
  if (loaderData.error) {
    return (
      <Page title="Billing">
        <Layout>
          <Layout.Section>
            <Card>
              <div style={{ textAlign: "center", padding: "2rem" }}>
                <Text variant="bodyMd" as="p" tone="critical">
                  {loaderData.error}
                </Text>
              </div>
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

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
            await topUp(amount);
            setShowTopUpModal(false);
            refetch(); // Refresh billing data
          } catch (error) {
            console.error("Top-up failed:", error);
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
