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
  // Billing
  getBillingData: billingApi.getBillingData.bind(billingApi),
  topUpWallet: billingApi.topUpWallet.bind(billingApi),
  getPlans: billingApi.getPlans.bind(billingApi),
  upgradePlan: billingApi.upgradePlan.bind(billingApi),

  // Dashboard
  getAnalytics: dashboardApi.getAnalytics.bind(dashboardApi),
  getDashboardAnalytics: dashboardApi.getDashboardAnalytics.bind(dashboardApi),
  getDashboardStorePerformance:
    dashboardApi.getDashboardStorePerformance.bind(dashboardApi),
  getDashboardConversions:
    dashboardApi.getDashboardConversions.bind(dashboardApi),
  getDashboardMarketPerformance:
    dashboardApi.getDashboardMarketPerformance.bind(dashboardApi),
  getPerformance: dashboardApi.getPerformance.bind(dashboardApi),
  getRevenue: dashboardApi.getRevenue.bind(dashboardApi),

  // Customers
  getCustomers: customersApi.getCustomers.bind(customersApi),
  getCustomerSessions: customersApi.getCustomerSessions.bind(customersApi),
  getChatHistory: customersApi.getChatHistory.bind(customersApi),

  // Widget
  getWidgetConfig: widgetApi.getWidgetConfig.bind(widgetApi),
  updateWidgetConfig: widgetApi.updateWidgetConfig.bind(widgetApi),
  getWidgetAppearance: widgetApi.getWidgetAppearance.bind(widgetApi),
  updateWidgetAppearance: widgetApi.updateWidgetAppearance.bind(widgetApi),

  // Chat
  getChatRooms: chatApi.getChatRooms.bind(chatApi),
  getChatMessages: chatApi.getChatMessages.bind(chatApi),
  markChatMessagesAsRead: chatApi.markChatMessagesAsRead.bind(chatApi),

  // Profile
  getProfile: profileApi.getProfile.bind(profileApi),
  updateProfile: profileApi.updateProfile.bind(profileApi),
  changePassword: profileApi.changePassword.bind(profileApi),
};
