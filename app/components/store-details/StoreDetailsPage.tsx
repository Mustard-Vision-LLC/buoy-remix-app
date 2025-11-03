import { useLoaderData } from "@remix-run/react";
import { useState, useEffect } from "react";
import { Page, Tabs, Card, BlockStack, Frame } from "@shopify/polaris";
import ClientOnly from "../dashboard/ClientOnly";
import AnalyticsTab from "./AnalyticsTab";
import ChatsTab from "./ChatsTab";
import WidgetSettingsTab from "./WidgetSettingsTab";
import WidgetAppearanceTab from "./WidgetAppearanceTab";
import { setAccessToken, setShopUrl } from "~/utils/api";

export default function StoreDetailsPage() {
  const loaderData = useLoaderData<{ shop: string; accessToken?: string }>();
  const [selected, setSelected] = useState(0);

  // Set access token when loader data is received
  useEffect(() => {
    if (loaderData.accessToken) {
      setAccessToken(loaderData.accessToken);
      setShopUrl(loaderData.shop);
    }
  }, [loaderData.accessToken, loaderData.shop]);

  const tabs = [
    {
      id: "analytics",
      content: "Analytics",
      panelID: "analytics-panel",
    },
    {
      id: "chats",
      content: "Chats",
      panelID: "chats-panel",
    },
    {
      id: "widget-settings",
      content: "Widget Settings",
      panelID: "widget-settings-panel",
    },
    {
      id: "widget-appearance",
      content: "Widget Appearance",
      panelID: "widget-appearance-panel",
    },
  ];

  return (
    <Frame>
      <Page
        title={`Store: ${loaderData.shop}`}
        backAction={{ content: "Stores", url: "/app/dashboard" }}
      >
        <BlockStack gap="500">
          <Card>
            <Tabs tabs={tabs} selected={selected} onSelect={setSelected}>
              {selected === 0 && (
                <div style={{ padding: "16px 0" }}>
                  <ClientOnly>
                    <AnalyticsTab />
                  </ClientOnly>
                </div>
              )}
              {selected === 1 && (
                <div style={{ padding: "16px 0" }}>
                  <ChatsTab />
                </div>
              )}
              {selected === 2 && (
                <div style={{ padding: "16px 0" }}>
                  <WidgetSettingsTab />
                </div>
              )}
              {selected === 3 && (
                <div style={{ padding: "16px 0" }}>
                  <WidgetAppearanceTab />
                </div>
              )}
            </Tabs>
          </Card>
        </BlockStack>
      </Page>
    </Frame>
  );
}
