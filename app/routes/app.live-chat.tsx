import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import LiveChatPage from "../components/live-chat/LiveChatPage";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  return json({
    message: "Live chat page loaded",
  });
};

export default function LiveChat() {
  return <LiveChatPage />;
}
