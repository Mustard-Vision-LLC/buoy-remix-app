import { AdminApiContext } from "@shopify/shopify-app-remix/server";

export const checkIfAppEmbedIsActivated = async (admin: any, session: any): Promise<boolean> => {
   
    const themesOfThisStore = await getThemesForStore(admin);
    const liveTheme = await getLiveTheme(themesOfThisStore);

    const assets = await getConfigSettingsJSONFile(admin, session, liveTheme.id);
    
    var parsed = JSON.parse(JSON.stringify(assets));
    var assetContents = JSON.parse(parsed.value);
    if(assetContents.current) {
        if(assetContents.current['blocks']) {
            var blocks = assetContents.current['blocks'];
            for(var i in blocks) {
                if(blocks[i].type == 'shopify://apps/fishook/blocks/floating_chat/0c0b42fd-fe88-462c-a051-6aec880415dc') {
                    return !blocks[i].disabled;
                }    
            }
        } 
    }

    return false;
}

export const getSettingsJSONFromTheme = async (admin: any, session: any, themeId: string, assetKey: string): Promise<any> => {
  return await admin.rest.resources.Asset.all({
    session: session,
    theme_id: themeId.replace('gid://shopify/OnlineStoreTheme/', ''),
    asset: {"key": assetKey}
  });
}

export const getConfigSettingsJSONFile = async (admin: any, session: any, themeId: any): Promise<any> => {
  const result = await getSettingsJSONFromTheme(admin, session, themeId, "config/settings_data.json");
  return result.data[0];
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