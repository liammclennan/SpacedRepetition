define('server', [], function () {
    var appUrl = 'http://localhost:11285';
    var errCallback = function (error) {
        console.err('An error occurred communicating with the server');
    };

    return {
        importGitWiki: function (url) {
            return Q($.post(appUrl + '/import?url=' + url)).catch(errCallback);
        }
    };
});
