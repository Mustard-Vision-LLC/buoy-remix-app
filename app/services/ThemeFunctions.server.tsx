import { AdminApiContext } from "@shopify/shopify-app-remix/server";

export const checkIfAppEmbedIsActivated = async (admin: any): Promise<boolean> => {
   
    const themesOfThisStore = await getThemesForStore(admin);
    const liveTheme = await getLiveTheme(themesOfThisStore);

    console.log('liveTheme', JSON.stringify(liveTheme));    

    const assets = await getConfigSettingsJSONFile(admin, liveTheme.id);
    
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

export const getSettingsJSONFromTheme = async (admin: any, themeId: string, assetKey: string): Promise<any> => {
  const themeGid = themeId.startsWith("gid://") ? themeId : `gid://shopify/OnlineStoreTheme/${themeId}`;

    const query = `
        query getAsset($themeId: ID!, $assetKey: String!) {
            theme(id: $themeId) {
                id
                name
                asset(key: $assetKey) {
                    key
                    publicUrl
                    content
                    size
                    createdAt
                    updatedAt
                }
            }
        }
    `;

    const response = await admin.graphql(query, {
        variables: {
            themeId: themeGid,
            assetKey: assetKey
        }
    });

    const result = await response.json();
    return result.data.theme.asset;
}

export const getConfigSettingsJSONFile = async (admin: any, themeId: any): Promise<any> => {
  const result = await getSettingsJSONFromTheme(admin, themeId, "config/settings_data.json");
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