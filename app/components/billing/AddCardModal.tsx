import { useState } from "react";
import {
  Modal,
  FormLayout,
  TextField,
  TextContainer,
  BlockStack,
} from "@shopify/polaris";

interface AddCardModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (cardData: CardFormData) => void;
  isLoading?: boolean;
}

interface CardFormData {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  nameOnCard: string;
}

export default function AddCardModal({
  open,
  onClose,
  onSubmit,
  isLoading = false,
}: AddCardModalProps) {
  const [formData, setFormData] = useState<CardFormData>({
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    nameOnCard: "",
  });

  const handleInputChange = (field: keyof CardFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
    onSubmit?.(formData);
    // Reset form after submission
    setFormData({
      cardNumber: "",
      expiryMonth: "",
      expiryYear: "",
      cvv: "",
      nameOnCard: "",
    });
  };

  const handleClose = () => {
    // Reset form when closing
    setFormData({
      cardNumber: "",
      expiryMonth: "",
      expiryYear: "",
      cvv: "",
      nameOnCard: "",
    });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Add Payment Method"
      primaryAction={{
        content: isLoading ? "Adding..." : "Add Card",
        onAction: handleSubmit,
        loading: isLoading,
        disabled:
          !formData.cardNumber ||
          !formData.expiryMonth ||
          !formData.expiryYear ||
          !formData.cvv ||
          !formData.nameOnCard,
      }}
      secondaryActions={[
        {
          content: "Cancel",
          onAction: handleClose,
        },
      ]}
    >
      <Modal.Section>
        <BlockStack gap="400">
          <TextContainer>
            <p>Add a new payment method to your account:</p>
          </TextContainer>

          <FormLayout>
            <TextField
              label="Name on Card"
              value={formData.nameOnCard}
              onChange={(value) => handleInputChange("nameOnCard", value)}
              autoComplete="cc-name"
            />

            <TextField
              label="Card Number"
              value={formData.cardNumber}
              onChange={(value) => handleInputChange("cardNumber", value)}
              placeholder="1234 5678 9012 3456"
              autoComplete="cc-number"
            />

            <FormLayout.Group>
              <TextField
                label="Expiry Month"
                value={formData.expiryMonth}
                onChange={(value) => handleInputChange("expiryMonth", value)}
                placeholder="MM"
                autoComplete="cc-exp-month"
              />

              <TextField
                label="Expiry Year"
                value={formData.expiryYear}
                onChange={(value) => handleInputChange("expiryYear", value)}
                placeholder="YY"
                autoComplete="cc-exp-year"
              />

              <TextField
                label="CVV"
                value={formData.cvv}
                onChange={(value) => handleInputChange("cvv", value)}
                placeholder="123"
                autoComplete="cc-csc"
              />
            </FormLayout.Group>
          </FormLayout>
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}
