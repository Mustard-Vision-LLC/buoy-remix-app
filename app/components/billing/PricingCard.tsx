import {
  Card,
  Text,
  Button,
  BlockStack,
  InlineStack,
  Box,
  Badge,
} from "@shopify/polaris";

interface PricingCardProps {
  type: string;
  description: string;
  price: string;
  billFrequency: string;
  features: { name: string; available: boolean }[];
  current?: boolean;
  onSelect?: () => void;
  isLoading?: boolean;
}

export default function PricingCard({
  type,
  description,
  price,
  billFrequency,
  features,
  current = false,
  onSelect,
  isLoading = false,
}: PricingCardProps) {
  return (
    <Card>
      <BlockStack gap="400">
        <InlineStack align="space-between">
          <Text variant="headingMd" as="h3">
            {type}
          </Text>
          {current && <Badge>Current Plan</Badge>}
        </InlineStack>

        <Text variant="bodyMd" as="p" tone="subdued">
          {description}
        </Text>

        <Box background="bg-surface-secondary" padding="400" borderRadius="200">
          <BlockStack gap="200">
            <Text variant="heading2xl" as="h4">
              {price}
            </Text>
            <Text variant="bodySm" as="p" tone="subdued">
              {billFrequency}
            </Text>
          </BlockStack>
        </Box>

        <BlockStack gap="200">
          {features.map((feature, index) => (
            <InlineStack key={index} gap="200">
              <Text variant="bodyMd" as="span">
                {feature.available ? "✓" : "✗"}
              </Text>
              <Text
                variant="bodyMd"
                as="p"
                tone={feature.available ? undefined : "subdued"}
              >
                {feature.name}
              </Text>
            </InlineStack>
          ))}
        </BlockStack>

        {!current && (
          <Button
            onClick={onSelect}
            disabled={isLoading}
            fullWidth
            variant="primary"
          >
            {isLoading ? "Updating..." : "Select Plan"}
          </Button>
        )}
      </BlockStack>
    </Card>
  );
}
