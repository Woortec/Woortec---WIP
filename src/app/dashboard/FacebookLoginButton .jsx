import React, { useEffect } from 'react';

const FacebookLoginButton = () => {
  useEffect(() => {
    window.fbAsyncInit = function() {
      FB.init({
        appId      : '961870345497057',
        cookie     : true,
        xfbml      : true,
        version    : 'v20.0'
      });
      FB.AppEvents.logPageView();   
    };

    (function(d, s, id){
       var js, fjs = d.getElementsByTagName(s)[0];
       if (d.getElementById(id)) {return;}
       js = d.createElement(s); js.id = id;
       js.src = "https://connect.facebook.net/en_US/sdk.js";
       fjs.parentNode.insertBefore(js, fjs);
     }(document, 'script', 'facebook-jssdk'));
  }, []);

  const handleLogin = () => {
    FB.login(function(response) {
      if (response.authResponse) {
        console.log('Welcome! Fetching your information.... ');
        FB.api('/me', function(response) {
          console.log('Good to see you, ' + response.name + '.');
          // Store user data in localStorage or send it to your server
          localStorage.setItem('fbUserData', JSON.stringify(response));
        });
      } else {
        console.log('User cancelled login or did not fully authorize.');
      }
    });
  };

  return (
    <button onClick={handleLogin}>Login with Facebook</button>
  );
};

export default FacebookLoginButton;
