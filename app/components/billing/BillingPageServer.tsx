import { useState, useCallback, useEffect } from "react";
import {
  useLoaderData,
  useActionData,
  useFetcher,
  useNavigation,
} from "@remix-run/react";
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
  Toast,
  Frame,
} from "@shopify/polaris";
import ChangePlanModal from "./ChangePlanModal";
import TopUpModal from "./TopUpModal";

interface Plan {
  uuid: string;
  is_current_plan: boolean;
  price: string;
  description: string;
  name: string;
  credit_limit: number;
  features: Array<{
    uuid: string;
    feature_is_enabled: boolean;
    feature: {
      uuid: string;
      code: string;
      description: string;
      name: string;
    };
    limit_value: number | null;
  }>;
}

interface BillingData {
  extra_bundle: boolean;
  balance: string;
  extra_bundle_cost: string;
  current_plan: {
    name: string;
    cost_per_token: string;
  };
  connected_stores: {
    active: number;
    inactive: number;
    total_stores: number;
  };
  customers: number;
  total_store_interactions: number;
  total_store_interaction_cost: number;
  total_store_interaction_token_balance: number;
}

interface LoaderData {
  shop: string | null;
  billingData: BillingData | null;
  plans: Plan[] | null;
  error: string | null;
}

interface ActionData {
  success?: boolean;
  message?: string;
  error?: string;
}

export default function BillingPage() {
  const loaderData = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const fetcher = useFetcher();
  const navigation = useNavigation();

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

  // Show toast when action completes
  useEffect(() => {
    if (actionData) {
      if (actionData.success && actionData.message) {
        showToast(actionData.message, false);
        setShowTopUpModal(false);
        setShowChangePlanModal(false);
      } else if (actionData.error) {
        showToast(actionData.error, true);
      }
    }
  }, [actionData, showToast]);

  const toastMarkup = toastActive ? (
    <Toast
      content={toastMessage}
      onDismiss={toggleToast}
      error={toastError}
      duration={4000}
    />
  ) : null;

  // Handle top-up submission
  const handleTopUp = (amount: number) => {
    fetcher.submit(
      {
        actionType: "topUp",
        amount: amount.toString(),
      },
      { method: "POST" },
    );
  };

  // Handle plan change submission
  const handlePlanChange = (planId: string, planName: string) => {
    fetcher.submit(
      {
        actionType: "changePlan",
        planId,
        planName,
      },
      { method: "POST" },
    );
  };

  const isSubmitting =
    navigation.state === "submitting" || fetcher.state === "submitting";

  // Show loader error
  if (loaderData.error) {
    return (
      <Frame>
        {toastMarkup}
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
      </Frame>
    );
  }

  // Show error state
  if (!loaderData.billingData || !loaderData.plans) {
    return (
      <Frame>
        {toastMarkup}
        <Page title="Billing">
          <Layout>
            <Layout.Section>
              <Card>
                <div style={{ textAlign: "center", padding: "2rem" }}>
                  <Text variant="bodyMd" as="p" tone="critical">
                    Failed to load billing data
                  </Text>
                </div>
              </Card>
            </Layout.Section>
          </Layout>
        </Page>
      </Frame>
    );
  }

  const data = loaderData.billingData;
  const plans = loaderData.plans;

  const interactionUsagePercentage = Math.min(
    (data.total_store_interactions /
      data.total_store_interaction_token_balance) *
      100,
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
                      disabled={isSubmitting}
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
                            {data.current_plan.name}
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
                          ${data.current_plan.cost_per_token}
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
                          {data.total_store_interactions} /{" "}
                          {data.total_store_interaction_token_balance}
                        </Text>
                      </BlockStack>

                      <BlockStack gap="200">
                        <Box>
                          <ProgressBar
                            progress={
                              (data.connected_stores.active /
                                data.connected_stores.total_stores) *
                              100
                            }
                            size="small"
                          />
                        </Box>
                        <Text variant="bodyXs" as="p" fontWeight="semibold">
                          Connected Stores
                        </Text>
                        <Text variant="bodyXs" as="p" tone="subdued">
                          {data.connected_stores.active} active /{" "}
                          {data.connected_stores.total_stores} total
                        </Text>
                      </BlockStack>

                      <BlockStack gap="200">
                        <Box>
                          <ProgressBar progress={0} size="small" />
                        </Box>
                        <Text variant="bodyXs" as="p" fontWeight="semibold">
                          Customers
                        </Text>
                        <Text variant="bodyXs" as="p" tone="subdued">
                          {data.customers} / unlimited
                        </Text>
                      </BlockStack>
                    </InlineStack>
                    <Button
                      onClick={() => setShowChangePlanModal(true)}
                      fullWidth
                      disabled={isSubmitting}
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
          onSubmit={handleTopUp}
          isLoading={isSubmitting}
        />

        {/* Change Plan Modal */}
        <ChangePlanModal
          open={showChangePlanModal}
          onClose={() => setShowChangePlanModal(false)}
          onPlanSelect={handlePlanChange}
          isLoading={isSubmitting}
          plans={plans}
          plansLoading={false}
        />
      </Page>
    </Frame>
  );
}
