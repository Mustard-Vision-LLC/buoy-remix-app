import { TitleBar } from "@shopify/app-bridge-react";
import {
  Button,
  ButtonGroup,
  Card,
  InlineStack,
  Layout,
  Page,
  Tabs,
  Text,
} from "@shopify/polaris";
import ChatWidget from "./chat/ChatWidget";
import { useCallback, useState } from "react";

export default function WindowShopperPage() {
  const [selected, setSelected] = useState(0);

  const handleTabChange = useCallback(
    (selectedTabIndex: number) => setSelected(selectedTabIndex),
    [],
  );

  const tabs = [
    {
      id: "all-customers-1",
      content: "All",
      accessibilityLabel: "All customers",
      panelID: "all-customers-content-1",
    },
    {
      id: "accepts-marketing-1",
      content: "Accepts marketing",
      panelID: "accepts-marketing-content-1",
    },
    {
      id: "repeat-customers-1",
      content: "Repeat customers",
      panelID: "repeat-customers-content-1",
    },
    {
      id: "prospects-1",
      content: "Prospects",
      panelID: "prospects-content-1",
    },
  ];

  return (
    <Page>
      <TitleBar title="Window Shopper">
        <button variant="primary">Learn more</button>
      </TitleBar>

      <div className="mb-6">
        <InlineStack gap="100" align="space-between">
          <Text as={"h1"} variant="headingLg">
            Window Shopper
          </Text>

          <ButtonGroup>
            <Button variant="primary">Book a demo</Button>
            <Button variant="secondary">Publish now</Button>
          </ButtonGroup>
        </InlineStack>
      </div>

      <div className="mb-1">
        <Tabs tabs={tabs} selected={selected} onSelect={handleTabChange} />
      </div>

      <Layout>
        <Layout.Section>
          <Card>
            <div className="mb-6">
              <Text as={"h2"} variant="headingMd">
                {tabs[selected].content}
              </Text>
            </div>

            <Text as={"p"} variant="bodyMd">
              Window shoppers are customers who have added items to their cart
              but have not completed the purchase. They are potential customers
              who may need a little extra encouragement to complete their
              purchase.
            </Text>
          </Card>
        </Layout.Section>

        <Layout.Section variant="oneThird">
          <Card background="bg-fill-secondary" roundedAbove="xs">
            <ChatWidget />
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
