import { Box, Text, DataTable } from "@shopify/polaris";

interface ViewedProduct {
  product: { title: string };
  view_count: number;
}

interface PurchasedProduct {
  serialNumber: number;
  productName: string;
  revenue: string;
  quantitySold: number;
}

interface ProductsTableProps {
  type: "viewed" | "purchased";
  data?: ViewedProduct[] | PurchasedProduct[];
}

export default function ProductsTable({ type, data = [] }: ProductsTableProps) {
  // Empty state - no products
  if (!data || data?.length === 0) {
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

  // Prepare table data based on type
  let rows: (string | number)[][] = [];
  let headings: string[] = [];

  if (type === "viewed") {
    headings = ["S/N", "Product Name", "Views"];
    rows = (data as ViewedProduct[]).map((item, idx) => [
      idx + 1,
      item.product?.title || "N/A",
      item.view_count,
    ]);
  } else {
    headings = ["S/N", "Product Name", "Quantity Sold", "Revenue"];
    rows = (data as PurchasedProduct[]).map((item) => [
      item.serialNumber,
      item.productName,
      item.quantitySold,
      item.revenue,
    ]);
  }

  return (
    <DataTable
      columnContentTypes={
        type === "viewed"
          ? ["numeric", "text", "numeric"]
          : ["numeric", "text", "numeric", "text"]
      }
      headings={headings}
      rows={rows}
    />
  );
}
