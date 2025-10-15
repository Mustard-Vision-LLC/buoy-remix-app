import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { useLoaderData } from "@remix-run/react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  console.log("🔍 Testing session storage...");
  console.log("Access Token:", session.accessToken);
  console.log("Shop Domain:", session.shop);
  console.log("Session ID:", session.id);

  // Test: Store a simple value in the session
  const testValue = "Hello from session!";
  const timestamp = new Date().toISOString();

  // Add custom data to session (cast to any to bypass TypeScript)
  (session as any).testValue = testValue;
  (session as any).timestamp = timestamp;
  (session as any).randomNumber = Math.floor(Math.random() * 1000);

  console.log("✅ Stored in session:", { testValue, timestamp });
  console.log("📦 Full session object keys:", Object.keys(session));
  console.log("📦 Test value from session:", (session as any).testValue);
  console.log("📦 Timestamp from session:", (session as any).timestamp);
  console.log("📦 Random number from session:", (session as any).randomNumber);

  return json({
    shop: session.shop,
    testValue: (session as any).testValue,
    timestamp: (session as any).timestamp,
    randomNumber: (session as any).randomNumber,
    sessionId: session.id,
  });
};

export default function Index() {
  const data = useLoaderData<typeof loader>();

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Session Storage Test</h1>
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
          <strong>Session ID:</strong> {data.sessionId}
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
          Refresh this page. If the random number stays the same, session
          storage is working!
        </p>
      </div>
    </div>
  );
}
