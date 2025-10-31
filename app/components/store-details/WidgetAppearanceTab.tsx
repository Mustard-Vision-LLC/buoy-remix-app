import { useState } from "react";
import {
  Card,
  BlockStack,
  InlineStack,
  Text,
  Button,
  TextField,
  Select,
  ColorPicker,
  hsbToRgb,
} from "@shopify/polaris";

export default function WidgetAppearanceTab() {
  const [widgetTitle, setWidgetTitle] = useState("Chat with us");
  const [position, setPosition] = useState("bottom-right");
  const [primaryColor, setPrimaryColor] = useState({
    hue: 210,
    saturation: 1,
    brightness: 0.87,
  });
  const [size, setSize] = useState("medium");

  const handleSave = () => {
    // Save functionality will be added when API is available
    console.log("Saving widget appearance:", {
      widgetTitle,
      position,
      primaryColor,
      size,
    });
  };

  const positionOptions = [
    { label: "Bottom Right", value: "bottom-right" },
    { label: "Bottom Left", value: "bottom-left" },
    { label: "Top Right", value: "top-right" },
    { label: "Top Left", value: "top-left" },
  ];

  const sizeOptions = [
    { label: "Small", value: "small" },
    { label: "Medium", value: "medium" },
    { label: "Large", value: "large" },
  ];

  const rgb = hsbToRgb(primaryColor);
  const colorHex = `#${rgb.red.toString(16).padStart(2, "0")}${rgb.green
    .toString(16)
    .padStart(2, "0")}${rgb.blue.toString(16).padStart(2, "0")}`;

  return (
    <BlockStack gap="500">
      <Card>
        <BlockStack gap="400">
          <Text variant="headingSm" as="h3">
            Widget Customization
          </Text>

          <TextField
            label="Widget Title"
            value={widgetTitle}
            onChange={setWidgetTitle}
            autoComplete="off"
            helpText="This will appear at the top of the chat widget"
          />

          <Select
            label="Widget Position"
            options={positionOptions}
            value={position}
            onChange={setPosition}
            helpText="Choose where the widget appears on your store"
          />

          <Select
            label="Widget Size"
            options={sizeOptions}
            value={size}
            onChange={setSize}
            helpText="Select the size of the chat widget button"
          />

          <BlockStack gap="200">
            <Text variant="bodyMd" as="p">
              Primary Color
            </Text>
            <Text variant="bodySm" as="p" tone="subdued">
              Current color: {colorHex}
            </Text>
            <div style={{ marginTop: "8px" }}>
              <ColorPicker color={primaryColor} onChange={setPrimaryColor} />
            </div>
          </BlockStack>
        </BlockStack>
      </Card>

      <Card>
        <BlockStack gap="300">
          <Text variant="headingSm" as="h3">
            Preview
          </Text>
          <div
            style={{
              border: "1px dashed #c9cccf",
              borderRadius: "8px",
              padding: "40px",
              textAlign: "center",
              minHeight: "200px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text variant="bodyMd" as="p" tone="subdued">
              Widget preview will appear here
            </Text>
          </div>
        </BlockStack>
      </Card>

      <InlineStack align="end">
        <Button variant="primary" onClick={handleSave}>
          Save Appearance
        </Button>
      </InlineStack>
    </BlockStack>
  );
}
