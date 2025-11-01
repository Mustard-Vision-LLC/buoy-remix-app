import { useState } from "react";
import {
  Card,
  BlockStack,
  InlineStack,
  Text,
  Button,
  Select,
  Checkbox,
  DropZone,
  Thumbnail,
} from "@shopify/polaris";

const THEME_COLORS = [
  { name: "Red", value: "red", hex: "#D32F2F", bubbleColor: "#FFEBEE" },
  { name: "Pink", value: "pink", hex: "#C2185B", bubbleColor: "#FCE4EC" },
  { name: "Purple", value: "purple", hex: "#7B1FA2", bubbleColor: "#F3E5F5" },
  {
    name: "Deep Purple",
    value: "deep-purple",
    hex: "#512DA8",
    bubbleColor: "#EDE7F6",
  },
  { name: "Blue", value: "blue", hex: "#1976D2", bubbleColor: "#E3F2FD" },
  { name: "Cyan", value: "cyan", hex: "#0097A7", bubbleColor: "#E0F7FA" },
  { name: "Teal", value: "teal", hex: "#00695C", bubbleColor: "#E0F2F1" },
  { name: "Green", value: "green", hex: "#388E3C", bubbleColor: "#E8F5E9" },
  { name: "Lime", value: "lime", hex: "#AFB42B", bubbleColor: "#F9FBE7" },
  { name: "Yellow", value: "yellow", hex: "#FBC02D", bubbleColor: "#FFFDE7" },
  { name: "Orange", value: "orange", hex: "#F57C00", bubbleColor: "#FFF3E0" },
  {
    name: "Deep Orange",
    value: "deep-orange",
    hex: "#E64A19",
    bubbleColor: "#FBE9E7",
  },
  { name: "Brown", value: "brown", hex: "#5D4037", bubbleColor: "#EFEBE9" },
  { name: "Gray", value: "gray", hex: "#616161", bubbleColor: "#FAFAFA" },
];

export default function WidgetAppearanceTab() {
  const [customize, setCustomize] = useState(false);
  const [theme, setTheme] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const handleSave = () => {
    // Save functionality will be added when API is available
    console.log("Saving widget appearance:", {
      customize,
      theme,
      logoFile,
    });
  };

  const handleDropZoneDrop = (files: File[]) => {
    const file = files[0];
    if (file) {
      if (logoPreview && logoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(logoPreview);
      }
      setLogoFile(file);
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);
    }
  };

  const handleRemoveLogo = () => {
    if (logoPreview && logoPreview.startsWith("blob:")) {
      URL.revokeObjectURL(logoPreview);
    }
    setLogoFile(null);
    setLogoPreview(null);
  };

  const themeOptions = THEME_COLORS.map((color) => ({
    label: `${color.name} (${color.hex})`,
    value: color.value,
  }));

  const selectedThemeColor = THEME_COLORS.find(
    (color) => color.value === theme,
  );

  return (
    <BlockStack gap="500">
      <Card>
        <BlockStack gap="400">
          <InlineStack align="start" gap="400" blockAlign="start">
            <div style={{ paddingTop: "2px" }}>
              <Checkbox
                label=""
                checked={customize}
                onChange={(value) => setCustomize(value)}
              />
            </div>
            <BlockStack gap="100">
              <Text variant="headingMd" as="h3" fontWeight="semibold">
                Customize
              </Text>
              <Text variant="bodySm" as="p" tone="subdued">
                Customize your store widget to reflect your brand's unique look
                and feel.
              </Text>
            </BlockStack>
          </InlineStack>

          {customize && (
            <div style={{ paddingLeft: "48px" }}>
              <BlockStack gap="500">
                {/* Logo Upload Section */}
                <BlockStack gap="300">
                  <Text variant="headingSm" as="h4" fontWeight="medium">
                    Logo
                  </Text>
                  <Text variant="bodySm" as="p" tone="subdued">
                    We recommend using a white background image of your brand
                    logo with dimension of 200px x 200px
                  </Text>

                  {logoPreview ? (
                    <InlineStack gap="400" blockAlign="center">
                      <Thumbnail
                        source={logoPreview}
                        size="large"
                        alt="Logo preview"
                      />
                      <Button onClick={handleRemoveLogo} tone="critical">
                        Remove
                      </Button>
                    </InlineStack>
                  ) : (
                    <DropZone
                      onDrop={handleDropZoneDrop}
                      accept="image/*"
                      type="image"
                    >
                      <DropZone.FileUpload actionTitle="Click here to add image" />
                    </DropZone>
                  )}
                </BlockStack>

                {/* Theme Color Selection */}
                <BlockStack gap="300">
                  <Text variant="bodyMd" as="p" fontWeight="medium">
                    Select theme color
                  </Text>
                  <Select
                    label=""
                    labelHidden
                    options={[
                      { label: "Set theme color", value: "" },
                      ...themeOptions,
                    ]}
                    value={theme}
                    onChange={setTheme}
                    placeholder="Set theme color"
                  />
                  {selectedThemeColor && (
                    <InlineStack gap="200" blockAlign="center">
                      <div
                        style={{
                          width: "20px",
                          height: "20px",
                          borderRadius: "50%",
                          backgroundColor: selectedThemeColor.hex,
                          border: "1px solid #c9cccf",
                        }}
                      />
                      <Text variant="bodySm" as="p" tone="subdued">
                        {selectedThemeColor.name} - {selectedThemeColor.hex}
                      </Text>
                    </InlineStack>
                  )}
                </BlockStack>
              </BlockStack>
            </div>
          )}
        </BlockStack>
      </Card>

      <InlineStack align="end">
        <Button variant="primary" onClick={handleSave}>
          Save
        </Button>
      </InlineStack>
    </BlockStack>
  );
}
