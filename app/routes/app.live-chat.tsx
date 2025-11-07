import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import LiveChatPage from "../components/live-chat/LiveChatPage";
import { apiClient, setAccessToken, setShopUrl } from "../utils/api";
import prisma from "~/db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session: shopifySession } = await authenticate.admin(request);

  if (!shopifySession?.shop || !shopifySession?.accessToken) {
    throw new Error("Missing Shopify session data");
  }

  // Get the access token from the database
  const dbRecord = await prisma.session.findFirst({
    where: {
      shop: shopifySession.shop,
    },
  });

  if (!dbRecord?.shop || !dbRecord?.accessToken) {
    throw new Error("Missing session data");
  }

  // Set the access token and shop URL for API calls
  setAccessToken(dbRecord.accessToken);
  setShopUrl(dbRecord.shop);

  try {
    // Fetch chat rooms
    const chatRoomsResponse = await apiClient.getChatRooms();

    return json({
      shop: shopifySession.shop,
      accessToken: dbRecord.accessToken,
      chatRooms: chatRoomsResponse.data || [],
    });
  } catch (error) {
    console.error("Error fetching chat rooms:", error);
    // Return with empty chat rooms if the API call fails
    return json({
      shop: shopifySession.shop,
      accessToken: dbRecord.accessToken,
      chatRooms: [],
    });
  }
};

export default function LiveChat() {
  return <LiveChatPage />;
}
