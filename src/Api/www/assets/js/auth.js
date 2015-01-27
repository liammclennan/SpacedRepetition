define('auth', ['server'], function (server) {
    var googleToken;

    function authCallback(authResult) {
      console.dir(authResult);
      if (authResult['status']['signed_in']) {
        googleToken = authResult.access_token;
        document.getElementById('signinButton').setAttribute('style', 'display: none');
        server.authenticate(googleToken)
            .then(function (token) {
                localStorage.setItem('nancyToken', token);                
            })
            .catch(function (error) {console.error(err);});
      } else {
        return Q(authResult['error']);
      }
    }

    window.authCallback = authCallback;

    return {
        authCallback: authCallback
        
    };
});