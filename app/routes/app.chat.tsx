import { Modal, TitleBar } from "@shopify/app-bridge-react";
import {
  Box,
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

export default function ChatPage() {
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
      <TitleBar title="Buoy Widget">
        <button variant="primary">Learn more</button>
      </TitleBar>

      <div className="mb-6">
        <InlineStack gap="100" align="space-between">
          <Text as={"h1"} variant="headingLg">
            Buoy AI Chat
          </Text>

          <ButtonGroup>
            <Button
              variant="primary"
              onClick={() => shopify.modal.show("create-product-modal")}
            >
              Create a product
            </Button>
            <Button variant="secondary">Publish now</Button>
          </ButtonGroup>
        </InlineStack>
      </div>

      <div className="mb-1">
        <Tabs tabs={tabs} selected={selected} onSelect={handleTabChange} />
      </div>

      <Modal id="create-product-modal">
        <Box padding="500">
          <Text as={"h2"} variant="headingMd">
            Create a new product
          </Text>

          <Text as={"p"}>
            You can create a new product from here. This is a modal.
          </Text>

          <ButtonGroup>
            <Button onClick={() => console.log("Create")}>Create</Button>
            <Button onClick={() => console.log("Cancel")}>Cancel</Button>
          </ButtonGroup>
        </Box>
      </Modal>

      <Layout>
        <Layout.Section>
          <Card>
            <div className="mb-6">
              <Text as={"h1"} variant="headingLg">
                {tabs[selected].content}
              </Text>
            </div>

            <Text as={"h2"} variant="headingMd">
              Chat with us
            </Text>

            <Text as={"p"}>
              We are here to help you with your abandoned carts.
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
