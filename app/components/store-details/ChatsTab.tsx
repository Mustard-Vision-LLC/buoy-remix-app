import { Card, EmptyState } from "@shopify/polaris";

export default function ChatsTab() {
  return (
    <Card>
      <EmptyState
        heading="No chat conversations yet"
        image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
      >
        <p>Chat conversations with customers will appear here.</p>
      </EmptyState>
    </Card>
  );
}
