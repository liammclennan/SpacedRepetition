define('auth', ['server','euclid'], function (server,euclid) {

    function watch() {
        navigator.id.watch({
          loggedInUser: window.localStorage.getItem("email"),
          onlogin: function(assertion) {
            $.ajax({ 
              type: 'POST',
              url: '/auth/login',
              data: {assertion: assertion},
              success: function(res, status, xhr) { 
                window.localStorage.setItem("email", res);
                window.location.href = '/';
            },
              error: function(xhr, status, err) {
                navigator.id.logout();
              }
            });
          },
          onlogout: function() {
            $.ajax({
              type: 'POST',
              url: '/auth/logout', 
              success: function(res, status, xhr) { window.location.href = '/'; },
              error: function(xhr, status, err) { alert("Logout failure: " + err); }
            });
          }
        });
    }

    return {
        watch: watch,
        isAuthenticated: function () {
            return !!(window.localStorage.getItem("email") && window.localStorage.getItem("email") != "");
        },
        user: function () {
            return window.localStorage.getItem("email");
        },
        logout: function () {
            navigator.id.logout();
            window.localStorage.removeItem("email");
        }
    };
});