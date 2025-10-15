import { useState } from "react";
import { Modal, TextField, TextContainer, BlockStack } from "@shopify/polaris";

interface TopUpModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (amount: number) => void;
  isLoading?: boolean;
}

export default function TopUpModal({
  open,
  onClose,
  onSubmit,
  isLoading = false,
}: TopUpModalProps) {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    const numericAmount = parseFloat(amount);
    if (numericAmount < 50) {
      setError("Minimum top-up amount is $50");
      return;
    }
    if (numericAmount > 0) {
      onSubmit?.(numericAmount);
      setAmount("");
      setError("");
    }
  };

  const handleClose = () => {
    setAmount("");
    setError("");
    onClose();
  };

  const handleAmountChange = (value: string) => {
    setAmount(value);
    setError(""); // Clear error when user types
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Top-up Amount"
      primaryAction={{
        content: isLoading ? "Processing..." : "Proceed",
        onAction: handleSubmit,
        loading: isLoading,
        disabled: !amount.trim() || parseFloat(amount) <= 0,
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
            <p>Enter the amount you want to add to your account balance:</p>
            <p style={{ fontSize: "0.875rem", color: "#616161", marginTop: "0.5rem" }}>
              Minimum amount: $50
            </p>
          </TextContainer>

          <TextField
            label="Amount"
            value={amount}
            onChange={handleAmountChange}
            placeholder="Enter amount (minimum $50)"
            type="number"
            prefix="$"
            autoComplete="off"
            error={error}
            min="50"
          />
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}
