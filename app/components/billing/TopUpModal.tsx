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

  const handleSubmit = () => {
    const numericAmount = parseFloat(amount);
    if (numericAmount > 0) {
      onSubmit?.(numericAmount);
      setAmount("");
    }
  };

  const handleClose = () => {
    setAmount("");
    onClose();
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
          </TextContainer>

          <TextField
            label="Amount"
            value={amount}
            onChange={setAmount}
            placeholder="Enter amount"
            type="number"
            prefix="$"
            autoComplete="off"
          />
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}
