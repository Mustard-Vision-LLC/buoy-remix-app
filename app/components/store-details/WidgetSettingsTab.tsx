import { useState } from "react";
import {
  Card,
  BlockStack,
  InlineStack,
  Text,
  Button,
  Checkbox,
} from "@shopify/polaris";

interface WidgetFeature {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

function WidgetSettingItem({
  title,
  description,
  checked,
  onToggle,
}: {
  title: string;
  description: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <InlineStack align="start" gap="400" blockAlign="start">
      <div style={{ paddingTop: "2px" }}>
        <Checkbox label="" checked={checked} onChange={onToggle} />
      </div>
      <BlockStack gap="100">
        <Text variant="bodyMd" as="p" fontWeight="medium">
          {title}
        </Text>
        <Text variant="bodySm" as="p" tone="subdued">
          {description}
        </Text>
      </BlockStack>
    </InlineStack>
  );
}

export default function WidgetSettingsTab() {
  const [features, setFeatures] = useState<WidgetFeature[]>([
    {
      id: "1",
      title: "Assisted Shopping",
      description:
        "Help customers find products through AI-powered conversations and recommendations.",
      enabled: false,
    },
    {
      id: "2",
      title: "Abandoned Cart Recovery",
      description:
        "Automatically engage with customers who have items in their cart but haven't completed checkout.",
      enabled: false,
    },
    {
      id: "3",
      title: "Window Shopper",
      description:
        "Engage browsers and turn them into buyers with personalized product suggestions.",
      enabled: false,
    },
    {
      id: "4",
      title: "Coupon Interventions",
      description:
        "Offer strategic discounts at the right moment to encourage purchases and increase conversions.",
      enabled: false,
    },
  ]);

  const handleToggle = (id: string) => {
    setFeatures(
      features.map((feature) =>
        feature.id === id ? { ...feature, enabled: !feature.enabled } : feature,
      ),
    );
  };

  const handleSave = () => {
    // Save functionality will be added when API is available
    console.log("Saving widget settings:", features);
  };

  return (
    <BlockStack gap="400">
      <Card>
        <BlockStack gap="400">
          {features.map((feature) => (
            <WidgetSettingItem
              key={feature.id}
              title={feature.title}
              description={feature.description}
              checked={feature.enabled}
              onToggle={() => handleToggle(feature.id)}
            />
          ))}
        </BlockStack>
      </Card>

      <InlineStack align="end">
        <Button variant="primary" onClick={handleSave}>
          Save Settings
        </Button>
      </InlineStack>
    </BlockStack>
  );
}
