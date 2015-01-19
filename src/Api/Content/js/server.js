define('server', [], function () {
    var appUrl = 'http://localhost:11285';
    

    return {
        importGitWiki: function (url) {
            return doAjaxWithErrorHandler($.ajax(
                appUrl + '/import', {
                    contentType: 'application/json',
                    type: 'POST',
                    data: JSON.stringify({ url: url })
                }));
        },
        getDeck: function (url) {
            return doAjaxWithErrorHandler($.ajax(
                appUrl + '/deck/' + btoa(url), {
            }));
        }
    };

    function doAjaxWithErrorHandler(deferred) {
        return Q(deferred).catch(function (error) {
            console.err('An error occurred communicating with the server');
        });
    }
});
