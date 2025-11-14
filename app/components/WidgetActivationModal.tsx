import {
  Modal,
  Button,
  BlockStack,
  Text,
  InlineStack,
  Scrollable,
} from "@shopify/polaris";

interface WidgetActivationModalProps {
  open: boolean;
  onClose: () => void;
  deeplink: string;
}

export default function WidgetActivationModal({
  open,
  onClose,
  deeplink,
}: WidgetActivationModalProps) {
  const handleGoToThemeEditor = () => {
    window.open(deeplink, "_blank", "noopener,noreferrer");
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Widget activation instructions"
      primaryAction={{
        content: "Close",
        onAction: onClose,
      }}
    >
      <Modal.Section>
        <Scrollable style={{ maxHeight: "70vh" }}>
          <BlockStack gap="600">
            {/* Step 1 */}
            <BlockStack gap="300">
              <Text as="h3" variant="headingMd" fontWeight="semibold">
                Step 1. Click the button below to take you to the theme editor.
              </Text>
              <InlineStack align="start">
                <Button variant="primary" onClick={handleGoToThemeEditor}>
                  Go to Theme Editor
                </Button>
              </InlineStack>
            </BlockStack>

            {/* Step 2 */}
            <BlockStack gap="300">
              <Text as="h3" variant="headingMd" fontWeight="semibold">
                Step 2. Turn the Fishook AI toggle ON.
              </Text>
              <div style={{ width: "100%" }}>
                <img
                  src="/assets/images/step2.jpg"
                  alt="Step 2: Turn on Fishook AI toggle"
                  style={{
                    maxWidth: "100%",
                    height: "auto",
                    borderRadius: "8px",
                    border: "1px solid #e1e3e5",
                  }}
                />
              </div>
            </BlockStack>

            {/* Step 3 */}
            <BlockStack gap="300">
              <Text as="h3" variant="headingMd" fontWeight="semibold">
                Step 3: Click the Save button. That's it, you've activated the
                widget.
              </Text>
              <div style={{ width: "100%" }}>
                <img
                  src="/assets/images/step3.jpg"
                  alt="Step 3: Click Save button"
                  style={{
                    maxWidth: "100%",
                    height: "auto",
                    borderRadius: "8px",
                    border: "1px solid #e1e3e5",
                  }}
                />
              </div>
            </BlockStack>

            {/* Verification */}
            <BlockStack gap="400">
              <Text as="h3" variant="headingMd" fontWeight="semibold">
                Verification
              </Text>
              <Text as="p" variant="bodyMd">
                To verify that you have correctly activated the widget, wait for
                15 seconds. The widget should then pop up in the admin theme
                editor (see Picture A). Alternatively, go to your storefront,
                where you should see the widget appear in the bottom-right
                corner (see Picture B).
              </Text>

              <BlockStack gap="400">
                <div style={{ width: "100%" }}>
                  <img
                    src="/assets/images/picture_A.png"
                    alt="Widget showing in the admin theme editor"
                    style={{
                      maxWidth: "100%",
                      height: "auto",
                      borderRadius: "8px",
                      border: "1px solid #e1e3e5",
                    }}
                  />
                  <div style={{ marginTop: "8px", textAlign: "center" }}>
                    <Text as="p" variant="bodySm" tone="subdued">
                      Picture A: Widget showing in the admin theme editor
                    </Text>
                  </div>
                </div>

                <div style={{ width: "100%" }}>
                  <img
                    src="/assets/images/picture_B.png"
                    alt="Widget showing on the storefront"
                    style={{
                      maxWidth: "100%",
                      height: "auto",
                      borderRadius: "8px",
                      border: "1px solid #e1e3e5",
                    }}
                  />
                  <div style={{ marginTop: "8px", textAlign: "center" }}>
                    <Text as="p" variant="bodySm" tone="subdued">
                      Picture B: Widget showing on the storefront
                    </Text>
                  </div>
                </div>
              </BlockStack>
            </BlockStack>
          </BlockStack>
        </Scrollable>
      </Modal.Section>
    </Modal>
  );
}
