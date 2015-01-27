define('auth', ['server'], function (server) {
    var googleToken, authenticated = false;

    function authCallback(authResult) {
      if (authenticated) return;  
      if (authResult['status']['signed_in']) {
        googleToken = authResult.access_token;
        server.authenticate(googleToken)
            .then(function () {
                authenticated = true;
            })
            .catch(function (error) {console.error(err);});
      } else {
        console.error(authResult['error']);
      }
    }

    window.authCallback = authCallback;

    return {
        authCallback: authCallback,
        authenticated: function () {return authenticated;},
        notAuthenticated: function () { authenticated = false; }
    };
});