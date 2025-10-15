import { createCookieSessionStorage } from "@remix-run/node";

// Create our own cookie session storage for JWT tokens
export const jwtSessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__fishook_session",
    httpOnly: true,
    path: "/",
    sameSite: "none", // Required for embedded apps in iframes
    secrets: [process.env.SESSION_SECRET || "s3cr3t-change-this-in-production"],
    secure: true, // Must be true when sameSite is "none"
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
});

// Helper to get session from request
export async function getJWTSession(request: Request) {
  return jwtSessionStorage.getSession(request.headers.get("Cookie"));
}

// Get JWT token from session
export async function getJWTToken(request: Request) {
  const session = await getJWTSession(request);
  return session.get("jwt_token") as string | undefined;
}

// Get refresh token from session
export async function getRefreshToken(request: Request) {
  const session = await getJWTSession(request);
  return session.get("refresh_jwt_token") as string | undefined;
}

// Store tokens in session
export async function setTokens(
  request: Request,
  jwtToken: string,
  refreshToken: string,
) {
  const session = await getJWTSession(request);
  session.set("jwt_token", jwtToken);
  session.set("refresh_jwt_token", refreshToken);
  session.set("timestamp", new Date().toISOString());
  return session;
}

// Clear session
export async function clearSession(request: Request) {
  const session = await getJWTSession(request);
  session.unset("jwt_token");
  session.unset("refresh_jwt_token");
  session.unset("timestamp");
  return session;
}
