define('server', [], function () {
    var appUrl = 'http://localhost:11285';
    var errCallback = function (error) {
        console.err('An error occurred communicating with the server');
    };

    return {
        importGitWiki: function (url) {
            return Q($.ajax(
                appUrl + '/import', {
                    contentType: 'application/json',
                    type: 'POST',
                    data: JSON.stringify({ url: url })
                })).catch(errCallback);
        }
    };
});
