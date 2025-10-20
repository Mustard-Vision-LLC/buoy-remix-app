import { useState, useEffect, useCallback } from "react";
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
  Toast,
  Frame,
} from "@shopify/polaris";
import ChangePlanModal from "./ChangePlanModal";
import TopUpModal from "./TopUpModal";
import {
  useBillingData,
  useTopUp,
  useChangePlan,
  usePlans,
} from "../../hooks/useBilling";
import { setAccessToken, setShopUrl } from "../../utils/api";

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
      setShopUrl(loaderData.shop);
      // console.log(loaderData.accessToken, "loaderData.accessToken");
      // console.log("🔑 Access token received from loader");
    }
  }, [loaderData.accessToken, loaderData.shop]);

  const { data: billingData, loading, error, refetch } = useBillingData();
  const { topUp, loading: topUpLoading } = useTopUp(refetch); // Pass refetch callback
  const { changePlan, loading: changePlanLoading } = useChangePlan(refetch); // Pass refetch callback
  const { plans, loading: plansLoading } = usePlans();

  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [showChangePlanModal, setShowChangePlanModal] = useState(false);

  // Toast state
  const [toastActive, setToastActive] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastError, setToastError] = useState(false);

  const showToast = useCallback((message: string, isError = false) => {
    setToastMessage(message);
    setToastError(isError);
    setToastActive(true);
  }, []);

  const toggleToast = useCallback(
    () => setToastActive((active) => !active),
    [],
  );

  const reload = () => {
    window.location.reload();
    refetch();
  };

  const toastMarkup = toastActive ? (
    <Toast
      content={toastMessage}
      onDismiss={toggleToast}
      error={toastError}
      duration={4000}
    />
  ) : null;

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

  // Show error state - likely store not connected
  if (error || !billingData) {
    const isInvalidShopError =
      error?.includes("Invalid shop") || error?.includes("token");

    return (
      <Frame>
        {toastMarkup}
        <Page title="Billing">
          <Layout>
            <Layout.Section>
              <Card>
                <div style={{ textAlign: "center", padding: "3rem" }}>
                  <BlockStack gap="400">
                    <Text variant="headingLg" as="h2">
                      {isInvalidShopError
                        ? "Connect Your Store"
                        : "Unable to Load Billing"}
                    </Text>

                    <Text variant="bodyLg" as="p" tone="subdued">
                      {isInvalidShopError
                        ? "Please connect your Shopify store to Fishook to access billing information."
                        : "There was a problem loading your billing data."}
                    </Text>

                    {isInvalidShopError && (
                      <Text variant="bodySm" as="p" tone="subdued">
                        You'll need to sign up or log in to the Fishook
                        dashboard to link your store.
                      </Text>
                    )}

                    <InlineStack gap="300" align="center">
                      {isInvalidShopError ? (
                        <Button
                          variant="primary"
                          url="https://dashboard.fishook.online/merchant/auth/signup?source=shopify"
                          target="_blank"
                        >
                          Connect to Fishook
                        </Button>
                      ) : (
                        <Button onClick={reload}>Retry</Button>
                      )}
                    </InlineStack>
                  </BlockStack>
                </div>
              </Card>
            </Layout.Section>
          </Layout>
        </Page>
      </Frame>
    );
  }

  const data = billingData;

  const interactionUsagePercentage = Math.min(
    (data.interactions.total / data.interactions.limit) * 100,
    100,
  );

  return (
    <Frame>
      {toastMarkup}
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
                      Top-up your account balance, add funds for future
                      purchases
                    </Text>
                    <Box
                      background="bg-surface"
                      padding="400"
                      borderRadius="100"
                    >
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
              const result = await topUp(amount);

              if (!result?.redirect_url) {
                showToast(`Successfully topped up $${amount}!`);
                setShowTopUpModal(false);
              }
            } catch (error) {
              const message =
                error instanceof Error ? error.message : "Top-up failed";
              showToast(message, true);
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
              const result = await changePlan(planId);

              // If there's a redirect_url, the hook will handle redirection
              // Otherwise, show success toast
              if (!result?.redirect_url) {
                showToast(`Successfully upgraded to ${planName} plan!`);
                setShowChangePlanModal(false);
              }
              // Note: Modal will stay open during redirect to show loading state
            } catch (error) {
              const message =
                error instanceof Error ? error.message : "Plan change failed";
              showToast(message, true);
              console.error("Plan change failed:", error);
            }
          }}
          isLoading={changePlanLoading}
          plans={plans}
          plansLoading={plansLoading}
        />
      </Page>
    </Frame>
  );
}
