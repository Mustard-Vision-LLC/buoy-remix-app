import { useState, useEffect } from "react";
import {
  Card,
  BlockStack,
  InlineStack,
  Text,
  Button,
  Checkbox,
  Spinner,
  Banner,
} from "@shopify/polaris";
import { apiClient } from "~/utils/api";

interface WidgetFeature {
  id: string;
  code: string;
  name: string;
  description: string;
  feature_is_enabled: boolean;
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
  const [features, setFeatures] = useState<WidgetFeature[]>([]);
  const [enabledFeatures, setEnabledFeatures] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    const fetchWidgetConfig = async () => {
      try {
        const response = await apiClient.getWidgetConfig();
        const widgetConfig = response.data.widgetConfig || [];
        setFeatures(widgetConfig);
        const enabled = widgetConfig
          .filter((feature: WidgetFeature) => feature.feature_is_enabled)
          .map((feature: WidgetFeature) => feature.id);
        setEnabledFeatures(enabled);
      } catch (error) {
        console.error("Error fetching widget config:", error);
        setMessage({ type: "error", text: "Failed to load widget settings" });
      } finally {
        setLoading(false);
      }
    };

    fetchWidgetConfig();
  }, []);

  const handleToggle = (featureId: string) => {
    setEnabledFeatures((prev) => {
      if (prev.includes(featureId)) {
        return prev.filter((id) => id !== featureId);
      } else {
        return [...prev, featureId];
      }
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const featureUpdates = features.map((feature) => ({
        uuid: feature.id,
        is_enabled: enabledFeatures.includes(feature.id),
      }));

      await apiClient.updateWidgetConfig(featureUpdates);
      setMessage({
        type: "success",
        text: "Widget settings updated successfully!",
      });

      // Refresh the data
      const response = await apiClient.getWidgetConfig();
      const widgetConfig = response.data.widgetConfig || [];
      setFeatures(widgetConfig);
      const enabled = widgetConfig
        .filter((feature: WidgetFeature) => feature.feature_is_enabled)
        .map((feature: WidgetFeature) => feature.id);
      setEnabledFeatures(enabled);
    } catch (error: any) {
      console.error("Error updating widget config:", error);
      setMessage({
        type: "error",
        text: error.message || "Failed to update widget settings",
      });
    } finally {
      setSaving(false);
    }
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

  return (
    <BlockStack gap="400">
      {message && (
        <Banner
          tone={message.type === "success" ? "success" : "critical"}
          onDismiss={() => setMessage(null)}
        >
          {message.text}
        </Banner>
      )}

      <Card>
        <BlockStack gap="400">
          {features?.length > 0 ? (
            features.map((feature) => (
              <WidgetSettingItem
                key={feature.id}
                title={feature.name}
                description={feature.description}
                checked={enabledFeatures.includes(feature.id)}
                onToggle={() => handleToggle(feature.id)}
              />
            ))
          ) : (
            <Text variant="bodyMd" as="p" tone="subdued">
              No widget features available
            </Text>
          )}
        </BlockStack>
      </Card>

      <InlineStack align="end">
        <Button
          variant="primary"
          onClick={handleSave}
          loading={saving}
          disabled={saving}
        >
          Save Settings
        </Button>
      </InlineStack>
    </BlockStack>
  );
}
