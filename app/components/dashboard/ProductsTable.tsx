import { Box, Text } from "@shopify/polaris";

interface ProductsTableProps {
  type: "viewed" | "purchased";
}

export default function ProductsTable({ type }: ProductsTableProps) {
  // Empty state - no products
  return (
    <Box padding="400">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "200px",
          border: "1px dashed #c9cccf",
          borderRadius: "8px",
        }}
      >
        <Text variant="bodyMd" as="p" tone="subdued">
          No {type} products data available
        </Text>
      </div>
    </Box>
  );
}
