import { AdminApiContext } from "@shopify/shopify-app-remix/server";
const APP_EMBED_ID = `0c0b42fd-fe88-462c-a051-6aec880415dc`;
const APP_EMBED_TYPE = `shopify://apps/fishook/blocks/floating_chat/${APP_EMBED_ID}`;
const DEEP_LINK_ID = `${APP_EMBED_ID}/floating_chat`;

export const appEmbedDeepLink = (shop: string, liveThemeId: string): string|null => {
  liveThemeId = liveThemeId.startsWith('gid:') ? liveThemeId.replace('gid://shopify/OnlineStoreTheme/', ''): liveThemeId;
  return `https://${shop}/admin/themes/${liveThemeId}/editor?context=apps&activateAppId=${DEEP_LINK_ID}`;
}

export const checkIfAppEmbedIsActivated = async (admin: AdminApiContext, session: any): Promise<any> => {
  const { shop } = session;
  const themesOfThisStore = await getThemesForStore(admin);
  const liveTheme = await getLiveTheme(themesOfThisStore);
  const deeplink = appEmbedDeepLink(shop, liveTheme.id);
  var returnVal = { 
    status: false,
    activeStatus: false,
    liveThemeId: null,
    deeplink: deeplink
  }
  const assets = await getConfigSettingsJSONFile(admin, session, liveTheme.id);
  
  var parsed = JSON.parse(JSON.stringify(assets));
  
  var assetContents = JSON.parse(parsed.value);
  if(assetContents.current) {
    if(assetContents.current.blocks) {
      var blocks = assetContents.current.blocks;
      if(blocks != null) {
        for (const [key, value] of Object.entries(blocks)) {
          console.log('here key', key);
          console.log('value', value);
          if(value.type == APP_EMBED_TYPE) {
            returnVal = {
              status: true,
              activeStatus: !value.disabled,
              liveThemeId: liveTheme.id,
              deeplink: deeplink 
            }
          }
        }
      }
    } 
  }

  return returnVal;
}

export const getConfigSettingsJSONFile = async (admin: AdminApiContext, session: any, themeId: any): Promise<any> => {
  const result = await getSettingsJSONFromTheme(admin, session, themeId, "config/settings_data.json");
  return result.data[0];
}

export const getSettingsJSONFromTheme = async (admin: AdminApiContext, session: any, themeId: string, assetKey: string): Promise<any> => {
  return await admin.rest.resources.Asset.all({
    session: session,
    theme_id: themeId.replace('gid://shopify/OnlineStoreTheme/', ''),
    asset: {"key": assetKey}
  });
}

export const getLiveTheme = (themes: any): any => {
  if(themes != null && themes != undefined && themes.length) {
    for(var i in themes) {
      var currentTheme = themes[i]['node'];
      if(currentTheme['role'] == 'MAIN') {
        return currentTheme;
      }
    }
  }

  return null;
}

export const getThemesForStore = async (admin: AdminApiContext): Promise<any> => {
  const response = await admin.graphql(
    `query {
      themes(first: 10, roles: MAIN) {
        edges {
          node {
            name
            id
            role
          }
        }
      }
    }`
  );
  const result = await response.json();
  return result.data.themes.edges;
};