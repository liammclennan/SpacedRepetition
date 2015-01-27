define('auth', ['server','euclid'], function (server,euclid) {
    var googleToken;

    function authCallback(authResult) {
      if (authResult['status']['signed_in']) {
        googleToken = authResult.access_token;
        server.authenticate(googleToken)
            .then(function () {
                euclid.navigate('Home');
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