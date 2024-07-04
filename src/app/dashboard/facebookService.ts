// facebookService.ts

// Declare the global window interface to include fbAsyncInit
declare global {
  interface Window {
    fbAsyncInit: () => void;
  }
}

// Ensure the FB variable is declared globally
declare var FB: any;

// Load the Facebook SDK for JavaScript
window.fbAsyncInit = function() {
  FB.init({
    appId: '961870345497057', // Replace with your Facebook app ID
    cookie: true, // Enable cookies to allow the server to access the session
    xfbml: true, // Parse social plugins on this webpage
    version: 'v19.0' // Use this Graph API version
  });

  FB.AppEvents.logPageView();
};

(function(d, s, id) {
  var js: HTMLScriptElement, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) { return; }
  js = d.createElement(s) as HTMLScriptElement; js.id = id;
  js.src = "https://connect.facebook.net/en_US/sdk.js";
  if (fjs && fjs.parentNode) {
    fjs.parentNode.insertBefore(js, fjs);
  }
}(document, 'script', 'facebook-jssdk'));

// Function to handle login
export function handleLogin() {
  FB.login(function(response: any) {
    if (response.status === 'connected') {
      console.log('Logged in:', response);
      // Save the token or userID to local storage or backend
      localStorage.setItem('fbAccessToken', response.authResponse.accessToken);
    } else {
      console.log('User not authenticated');
    }
  }, { scope: 'public_profile,email,ads_read,ads_management' });
}
