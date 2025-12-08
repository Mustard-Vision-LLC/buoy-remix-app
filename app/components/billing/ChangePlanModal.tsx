import {
  Modal,
  TextContainer,
  BlockStack,
  InlineStack,
  Spinner,
  Text,
} from "@shopify/polaris";
import PricingCard from "./PricingCard";

// Map feature codes to user-friendly display names
const featureDisplayNames: Record<string, string> = {
  abandoned_cart: "Abandoned cart recovery",
  window_shopper: "Window shopper conversion",
  assisted_shopping: "Assisted shopping",
  checkout: "Checkout",
  customer_support_24_7: "24/7 customer support",
  live_agent_support: "Live agent support",
  intervention_analysis: "Intervention analysis",
  customer_behavioral_analysis: "Customer behavioral analysis",
};

// Define the order of features to display
const allFeatures = [
  "abandoned_cart",
  "window_shopper",
  "assisted_shopping",
  "checkout",
  "customer_support_24_7",
  "live_agent_support",
  "intervention_analysis",
  "customer_behavioral_analysis",
];

interface Feature {
  uuid: string;
  feature_is_enabled: boolean;
  feature: {
    uuid: string;
    code: string;
    description: string;
    name: string;
  };
  limit_value: number | null;
}

interface Plan {
  uuid: string;
  price: string;
  description: string;
  name: string;
  is_current_plan: boolean;
  credit_limit: number;
  features: Feature[];
}

interface ChangePlanModalProps {
  open: boolean;
  onClose: () => void;
  onPlanSelect?: (planId: string, planName: string) => void;
  isLoading?: boolean;
  plans?: Plan[];
  plansLoading?: boolean;
}

export default function ChangePlanModal({
  open,
  onClose,
  onPlanSelect,
  isLoading = false,
  plans = [],
  plansLoading = false,
}: ChangePlanModalProps) {
  const handlePlanSelect = (planId: string, planName: string) => {
    onPlanSelect?.(planId, planName);
  };

  const currentPlan = plans.find((plan) => plan.is_current_plan);
  const currentPlanType = currentPlan?.name || "Starter";

  // Transform API plans to match PricingCard format
  const transformedPlans = plans.map((plan) => {
    // Create a map of feature codes to their enabled status
    const planFeatureMap = new Map(
      plan.features.map((feature) => [
        feature.feature.code,
        feature.feature_is_enabled,
      ]),
    );

    // Build features array in consistent order with display names
    const features = allFeatures.map((featureCode) => ({
      name: featureDisplayNames[featureCode] || featureCode,
      available: planFeatureMap.get(featureCode) || false,
    }));

    return {
      id: plan.uuid,
      type: plan.name,
      description: plan.description,
      price: plan.price === "0" ? "Free" : `$${plan.price}`,
      billFrequency:
        plan.price === "0"
          ? `${plan.credit_limit} interactions, monthly`
          : "Per interaction, billed monthly",
      features,
      current: plan.is_current_plan,
      currentPlanType,
    };
  });

  return (
    <Modal open={open} onClose={onClose} title="Change Plan" size="large">
      <Modal.Section>
        {plansLoading ? (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <Spinner size="large" />
            <Text variant="bodyMd" as="p" tone="subdued">
              Loading plans...
            </Text>
          </div>
        ) : plans.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <Text variant="bodyMd" as="p" tone="critical">
              No plans available
            </Text>
          </div>
        ) : (
          <BlockStack gap="600">
            <TextContainer>
              <p>Choose the plan that best fits your business needs:</p>
            </TextContainer>

            <InlineStack gap="400" wrap={false}>
              {transformedPlans.map((plan) => (
                <div key={plan.id} style={{ flex: 1 }}>
                  <PricingCard
                    type={plan.type}
                    description={plan.description}
                    price={plan.price}
                    billFrequency={plan.billFrequency}
                    features={plan.features}
                    current={plan.current}
                    onSelect={() => handlePlanSelect(plan.id, plan.type)}
                    isLoading={isLoading}
                    currentPlanType={plan.currentPlanType}
                  />
                </div>
              ))}
            </InlineStack>

            <div style={{ textAlign: "center", marginTop: "1rem" }}>
              <a
                href="https://fishook.online/pricing"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#0070f3", textDecoration: "underline" }}
              >
                See detailed comparison
              </a>
            </div>
          </BlockStack>
        )}
      </Modal.Section>
    </Modal>
  );
}
