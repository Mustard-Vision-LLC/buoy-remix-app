import { BlockStack, Layout, Page } from "@shopify/polaris";

export default function Index() {
  return (
    <Page title="Billing">
      <p>Billing</p>

      <BlockStack gap="500">
        <Layout>
          <p>Billing details go here</p>
        </Layout>
      </BlockStack>
    </Page>
  );
}
