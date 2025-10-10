import {
  Modal,
  TextContainer,
  BlockStack,
  InlineStack,
} from "@shopify/polaris";
import PricingCard from "./PricingCard";

interface ChangePlanModalProps {
  open: boolean;
  onClose: () => void;
  onPlanSelect?: (planId: string, planName: string) => void;
  isLoading?: boolean;
}

// Mock plans data - replace with actual API data
const mockPlans = [
  {
    id: "starter",
    type: "Starter",
    description: "Perfect for getting started and seeing the power of Fishook",
    price: "Free",
    billFrequency: "300 interactions, monthly",
    features: [
      { name: "Abandoned cart recovery", available: true },
      { name: "Window shopper conversion", available: true },
      { name: "Assisted shopping", available: false },
      { name: "24/7 customer support", available: false },
      { name: "Live agent support", available: false },
      { name: "Intervention analysis", available: false },
      { name: "Customer behavioral analysis", available: false },
    ],
    current: true,
  },
  {
    id: "business",
    type: "Business",
    description: "Optimal for store with 100 daily orders and 100 customers",
    price: "$0.009",
    billFrequency: "Per interaction, billed monthly",
    features: [
      { name: "Abandoned cart recovery", available: true },
      { name: "Window shopper conversion", available: true },
      { name: "Assisted shopping", available: true },
      { name: "24/7 customer support", available: true },
      { name: "Live agent support", available: false },
      { name: "Intervention analysis", available: false },
      { name: "Customer behavioral analysis", available: false },
    ],
    current: false,
  },
  {
    id: "enterprise",
    type: "Enterprise",
    description: "For large stores with advanced needs",
    price: "$0.007",
    billFrequency: "Per interaction, billed monthly",
    features: [
      { name: "Abandoned cart recovery", available: true },
      { name: "Window shopper conversion", available: true },
      { name: "Assisted shopping", available: true },
      { name: "24/7 customer support", available: true },
      { name: "Live agent support", available: true },
      { name: "Intervention analysis", available: true },
      { name: "Customer behavioral analysis", available: true },
    ],
    current: false,
  },
];

export default function ChangePlanModal({
  open,
  onClose,
  onPlanSelect,
  isLoading = false,
}: ChangePlanModalProps) {
  const handlePlanSelect = (planId: string, planName: string) => {
    onPlanSelect?.(planId, planName);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Change Plan" size="large">
      <Modal.Section>
        <BlockStack gap="600">
          <TextContainer>
            <p>Choose the plan that best fits your business needs:</p>
          </TextContainer>

          <InlineStack gap="400" wrap={false}>
            {mockPlans.map((plan) => (
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
                />
              </div>
            ))}
          </InlineStack>
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}
