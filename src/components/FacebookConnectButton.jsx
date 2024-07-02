import React, { useEffect, useState } from 'react';

const FacebookConnectButton = () => {
  const [accessToken, setAccessToken] = useState(null);
  const [userID, setUserID] = useState(null);

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
        appId: 'your-app-id', // Replace with your Facebook app ID
        cookie: true,
        xfbml: true,
        version: 'v12.0',
      });
    };

    loadFacebookSDK();

    // Retrieve stored data
    const storedAccessToken = getFacebookAccessToken();
    const storedUserID = getFacebookUserID();

    if (storedAccessToken && storedUserID) {
      setAccessToken(storedAccessToken);
      setUserID(storedUserID);
    }
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

        // Update state
        setAccessToken(accessToken);
        setUserID(userID);
      } else {
        console.log('User cancelled login or did not fully authorize.');
      }
    }, { scope: 'public_profile,email,pages_manage_ads,pages_manage_metadata,pages_read_engagement,pages_read_user_content' });
  };

  const getFacebookAccessToken = () => {
    return localStorage.getItem('fbAccessToken');
  };

  const getFacebookUserID = () => {
    return localStorage.getItem('fbUserID');
  };

  return (
    <div>
      <button onClick={handleFBLogin}>
        Connect to Facebook
      </button>
      {accessToken && userID && (
        <div>
          <p>Access Token: {accessToken}</p>
          <p>User ID: {userID}</p>
        </div>
      )}
    </div>
  );
};

export default FacebookConnectButton;
