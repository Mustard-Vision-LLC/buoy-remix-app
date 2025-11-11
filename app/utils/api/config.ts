import CryptoJS from "crypto-js";

export const API_BASE_URL = "https://dashboard-api.fishook.online";

const SECRET_KEY =
  "$2a$10$YqnDG0Fu5.MdXVBlm9gRI.D75C0$YqnDG0Fu5.$10$YqnDG0Fu5.MdXVBlm9gR-i8cbLojkjfyba-.D75CQQvBU0.pGyrfGdFXAEAHrcLq3Tsa";

let shopifyAccessToken: string | null = null;
let shopUrl: string | null = null;

export function setAccessToken(accessToken: string) {
  shopifyAccessToken = accessToken;
}

export function setShopUrl(shop: string) {
  shopUrl = shop;
}

export function encryptAccessToken(token: string): string {
  return CryptoJS.AES.encrypt(token, SECRET_KEY).toString();
}

export function getEncryptedAccessToken(): string | null {
  if (!shopifyAccessToken) return null;
  return encryptAccessToken(shopifyAccessToken);
}

export function getShopUrl(): string | null {
  return shopUrl;
}
