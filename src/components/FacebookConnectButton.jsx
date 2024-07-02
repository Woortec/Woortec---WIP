import React, { useEffect } from 'react';

const FacebookConnectButton = () => {
  useEffect(() => {
    // Load the Facebook SDK
    const loadFacebookSDK = () => {
      if (window.FB) {
        initializeFacebookSDK();
        return;
      }

      (function(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) { return; }
        js = d.createElement(s); js.id = id;
        js.src = "https://connect.facebook.net/en_US/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
        js.onload = initializeFacebookSDK;
      }(document, 'script', 'facebook-jssdk'));
    };

    const initializeFacebookSDK = () => {
      window.FB.init({
        appId: '961870345497057', // Replace with your Facebook app ID
        cookie: true,
        xfbml: true,
        version: 'v19.0',
      });
    };

    loadFacebookSDK();
  }, []);

  const handleFBLogin = () => {
    if (!window.FB) {
      console.error('Facebook SDK not loaded yet');
      return;
    }

    window.FB.login(response => {
      if (response.authResponse) {
        // The user is logged in and has authenticated
        const { accessToken, userID } = response.authResponse;
        // Save the access token and user ID to local storage
        localStorage.setItem('fbAccessToken', accessToken);
        localStorage.setItem('fbUserID', userID);
        console.log('Logged in successfully');
        // You can now make API calls to your Facebook Marketing API
      } else {
        console.log('User cancelled login or did not fully authorize.');
      }
    }, { scope: 'public_profile,email,pages_manage_ads,pages_manage_metadata,pages_read_engagement,pages_read_user_content' });
  };

  return (
    <button onClick={handleFBLogin}>
      Connect to Facebook
    </button>
  );
};

export default FacebookConnectButton;
