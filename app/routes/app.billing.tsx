import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { useLoaderData } from "@remix-run/react";
import { getJWTSession, jwtSessionStorage } from "../session.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session: shopifySession } = await authenticate.admin(request);

  console.log("🔍 Testing cookie session storage...");
  console.log("Shop Domain:", shopifySession.shop);

  // Get our cookie session
  const cookieSession = await getJWTSession(request);

  // Check if we already have data in the cookie
  let randomNumber = cookieSession.get("randomNumber") as number | undefined;
  let timestamp = cookieSession.get("timestamp") as string | undefined;
  let testValue = cookieSession.get("testValue") as string | undefined;

  // If no data exists, create new data
  if (!randomNumber) {
    randomNumber = Math.floor(Math.random() * 1000);
    timestamp = new Date().toISOString();
    testValue = "Hello from Cookie Session!";

    // Store in cookie session
    cookieSession.set("randomNumber", randomNumber);
    cookieSession.set("timestamp", timestamp);
    cookieSession.set("testValue", testValue);

    console.log("✅ NEW data stored in cookie session");
  } else {
    console.log("✅ EXISTING data retrieved from cookie session");
  }

  console.log("📦 Random number:", randomNumber);
  console.log("📦 Timestamp:", timestamp);
  console.log("📦 Test value:", testValue);

  // Return JSON with Set-Cookie header
  return json(
    {
      shop: shopifySession.shop,
      testValue,
      timestamp,
      randomNumber,
      sessionId: shopifySession.id,
    },
    {
      headers: {
        "Set-Cookie": await jwtSessionStorage.commitSession(cookieSession),
      },
    },
  );
};

export default function Index() {
  const data = useLoaderData<typeof loader>();

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Cookie Session Storage Test</h1>
      <div
        style={{
          marginTop: "1rem",
          padding: "1rem",
          background: "#f0f0f0",
          borderRadius: "8px",
        }}
      >
        <p>
          <strong>Shop:</strong> {data.shop}
        </p>
        <p>
          <strong>Shopify Session ID:</strong> {data.sessionId}
        </p>
        <p>
          <strong>Test Value:</strong> {data.testValue}
        </p>
        <p>
          <strong>Timestamp:</strong> {data.timestamp}
        </p>
        <p>
          <strong>Random Number:</strong> {data.randomNumber}
        </p>
        <p style={{ marginTop: "1rem", fontSize: "0.9rem", color: "#666" }}>
          ✅ <strong>TEST:</strong> Refresh this page multiple times. If the
          random number <strong>STAYS THE SAME</strong>, cookie session storage
          is working!
        </p>
      </div>
    </div>
  );
}
