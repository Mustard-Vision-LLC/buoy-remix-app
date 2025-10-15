import { sessionStorage as shopifySessionStorage } from "./shopify.server";

// Store JWT tokens in Shopify session
export async function storeJWTTokens(
  sessionId: string,
  jwtToken: string,
  refreshToken: string,
) {
  const session = await shopifySessionStorage.loadSession(sessionId);
  if (!session) {
    throw new Error("Session not found");
  }

  // Add JWT tokens to the session (cast to any to bypass TypeScript)
  (session as any).jwtToken = jwtToken;
  (session as any).refreshJwtToken = refreshToken;

  // Save the updated session
  await shopifySessionStorage.storeSession(session);

  console.log("✅ JWT tokens stored in session");
  return session;
}

// Retrieve JWT tokens from Shopify session
export async function getJWTTokens(sessionId: string) {
  const session = await shopifySessionStorage.loadSession(sessionId);
  if (!session) {
    return null;
  }

  return {
    jwtToken: (session as any).jwtToken as string | undefined,
    refreshJwtToken: (session as any).refreshJwtToken as string | undefined,
  };
}

// Clear JWT tokens from session
export async function clearJWTTokens(sessionId: string) {
  const session = await shopifySessionStorage.loadSession(sessionId);
  if (!session) {
    return;
  }

  delete (session as any).jwtToken;
  delete (session as any).refreshJwtToken;

  await shopifySessionStorage.storeSession(session);
  console.log("🗑️ JWT tokens cleared from session");
}
