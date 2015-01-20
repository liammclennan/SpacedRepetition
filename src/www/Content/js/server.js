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
                appUrl + '/deck?url=' + url, {
            })).then(function (decks) {
                if (!decks || decks.length != 1)
                {
                    throw new Error('"getDeck" must return exactly one deck');
                }
                return decks[0];
            });
        },
        getDecks: function () {
            return doAjaxWithErrorHandler($.ajax(
                appUrl + '/decks'
            ));
        }
    };

    function doAjaxWithErrorHandler(deferred) {
        return Q(deferred).catch(function (error) {
            console.err('An error occurred communicating with the server');
        });
    }
});
