COOKIE_NAME = "fishook_guest_id";
JWT_COOKIE_NAME = "fishook_jwt";
VISITOR_COOKIE_NAME = "fishook_customer_token";
VISITOR_SESSION_COOKIE_NAME = "fishook_customer_session_token";
const fishookHost = "https://sandbox.fishook.online";
const embedTrackProductClicksUrl = `${fishookHost}/shopify/products/interactions`;
const embedsaveCartURL = `${fishookHost}/shopify/carts`;
let embedLastCartState = null;

function generateUUID() {
  if (window.crypto?.randomUUID) return crypto.randomUUID();
  return '0987654321Jh-dXVBlm9gRI.-s5uLOuyi8cbLojkjfyba-.D75CQvBU0.pGyrfGdFXAEAHrcL'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0, v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function setCookieStorage(name, value, expiresIn = 31536000) {
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; path=/; max-age=${expiresIn}`;
}

function getCookie(name) {
  const match = document.cookie.split('; ').find(cookie => cookie.startsWith(name + '='));
  return match ? decodeURIComponent(match.split('=')[1]) : null;
}

function getOrCreateGuestId() {
  const existing = document.cookie.split('; ').find(row => row.startsWith(COOKIE_NAME + '='));
  if (existing) return existing.split('=')[1];
  const newId = generateUUID();
  setCookieStorage(COOKIE_NAME,newId,31536000)
  return newId;
}

const guestId = getOrCreateGuestId();

async function updateCustomerCart(widget_jwt) {
  try {  
    const response = await fetch("/cart.js");
    if (!response.ok) 
      return;
    
    const cart = await response.json();
    const cartJSON = JSON.stringify(cart);

    if (cartJSON !== embedLastCartState) {
      embedLastCartState = cartJSON;
    }
    //const customer = window.Shopify?.customer || null;
    await fetch(embedsaveCartURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + widget_jwt,
      },
      body: JSON.stringify({ cart })
    });
  } catch (error) {
    console.error("Carts update failed with error:", error);
  }
}

async function handleShopifyCartEvents(widget_jwt) {
  try {
    const originalFetch = window.fetch;
    window.fetch = async function (...args) {
      const [ url ] = args;
      const response = await originalFetch(...args);
      //const clonedResponse = response.clone();

      if (url.includes("/cart/add.js") || url.includes("/cart/add")) {
        await updateCustomerCart(widget_jwt);
      }

      if (url.includes("/cart/change.js") || url.includes("/cart/change")) {
        await updateCustomerCart(widget_jwt);
      }
      return response;
    };
  } catch (error) {
    console.error("Cart event logging failed with error:", error);
  }
}

async function trackProductClicks(widget_jwt) {
  if (window.ShopifyAnalytics?.meta?.product) {
    const product = window.ShopifyAnalytics.meta.product;
    const customer = window.Shopify?.customer || null;
    await fetch(embedTrackProductClicksUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + widget_jwt
      },
      body: JSON.stringify({
        product_id: product.id,
        behavior_type: "VISITED"
      })
    });
  }
}

let embedIsIframeUpdated = false;
window.addEventListener('message', (event) => {
  // const widget_jwt = getCookie(JWT_COOKIE_NAME)
  // const CUSTOMER_ID = getCookie(VISITOR_COOKIE_NAME)
  if (event.origin !== 'https://embed.fishook.online') return;
  if(!embedIsIframeUpdated) {
    if (event.data?.type === 'fishook_session') {
      setCookieStorage(VISITOR_SESSION_COOKIE_NAME, event.data)
      const fishookIframe = document.getElementById('buoy-chat-frame');
      if(fishookIframe){
        embedIsIframeUpdated = true;
        //fishookIframe.src = 'https://embed.fishook.online?script_tag_id=null&shop_url='+shop+'&shop_type='+shop_type+'&jwt='+widget_jwt+'&customer_id='+CUSTOMER_ID+'&socket_id='+event.data.sessionId
      }
    }
  }
});

function loadPageFunctions(){
  let widget_jwt = getCookie(JWT_COOKIE_NAME)
  if(!widget_jwt.length) {
    fishookWidgetInit().then((response)=>{
      if(response.status_code !== 200){
        throw Error('Unsuccessful API call')
      }
      const JWT = response.data.jwt;
      const CUSTOMER_ID = response.data.customer_id;
      widget_jwt = JWT;
      setCookieStorage(JWT_COOKIE_NAME,JWT)
      setCookieStorage(VISITOR_COOKIE_NAME, CUSTOMER_ID) 
      if(widget_jwt){
          handleShopifyCartEvents(widget_jwt);
          trackProductClicks(widget_jwt);
      }
      createChatIframe('null', shop, 'SHOPIFY', JWT, CUSTOMER_ID);
    })
    .catch((err)=>{
      console.log('Unable to compete widget initialization:', err)
    })
  } else{
    const CUSTOMER_ID = getCookie(VISITOR_COOKIE_NAME)
    createChatIframe('null', shop, 'SHOPIFY', widget_jwt, CUSTOMER_ID);
    handleShopifyCartEvents(widget_jwt);
    trackProductClicks(widget_jwt);
  }
}

function waitForMainFishookFunction(fnName, callback, maxRetries = 5, attempt = 0, delay = 500) {
  if (typeof window[fnName] === 'function') {
    callback();
  } else {
    if (attempt >= maxRetries) {
      return;
    }
    // Retry with exponentially increased delay
    const nextDelay = delay * Math.pow(2, attempt);
    setTimeout(() => {
      waitForMainFishookFunction(fnName, callback, maxRetries, attempt + 1, delay);
    }, nextDelay);
  }
}

waitForMainFishookFunction('createChatIframe', () => {
  loadPageFunctions();
}, 5)