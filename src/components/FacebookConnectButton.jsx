import React, { useEffect, useState } from 'react';

const FacebookConnectButton = () => {
  const [isSdkLoaded, setIsSdkLoaded] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  const [userID, setUserID] = useState(null);

  useEffect(() => {
    const loadFacebookSDK = () => {
      return new Promise((resolve) => {
        if (window.FB) {
          resolve();
          return;
        }

        window.fbAsyncInit = function () {
          window.FB.init({
            appId: '961870345497057', // Replace with your Facebook app ID
            cookie: true,
            xfbml: true,
            version: 'v19.0',
          });
          resolve();
        };

        const id = 'facebook-jssdk';
        const fjs = document.getElementsByTagName('script')[0];
        if (document.getElementById(id)) { return; }
        const js = document.createElement('script');
        js.id = id;
        js.src = "https://connect.facebook.net/en_US/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
      });
    };

    loadFacebookSDK().then(() => {
      setIsSdkLoaded(true);
    });

    // Retrieve stored data
    const storedAccessToken = localStorage.getItem('fbAccessToken');
    const storedUserID = localStorage.getItem('fbUserID');

    if (storedAccessToken && storedUserID) {
      setAccessToken(storedAccessToken);
      setUserID(storedUserID);
    }
  }, []);

  const handleFBLogin = () => {
    if (!isSdkLoaded || !window.FB) {
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

  return (
    <div>
      <button onClick={handleFBLogin}>
        Connect to Facebook
      </button>
    </div>
  );
};

export default FacebookConnectButton;
