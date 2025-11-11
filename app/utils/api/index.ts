import { billingApi } from "./billing";
import { dashboardApi } from "./dashboard";
import { customersApi } from "./customers";
import { widgetApi } from "./widget";
import { chatApi } from "./chat";
import { profileApi } from "./profile";

export * from "./config";
export { billingApi } from "./billing";
export { dashboardApi } from "./dashboard";
export { customersApi } from "./customers";
export { widgetApi } from "./widget";
export { chatApi } from "./chat";
export { profileApi } from "./profile";

export const apiClient = {
  ...billingApi,
  ...dashboardApi,
  ...customersApi,
  ...widgetApi,
  ...chatApi,
  ...profileApi,
};
