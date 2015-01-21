define('server', ['fermat'], function (fermat) {
    var appUrl = 'http://localhost:11285';
    var serverStates = fermat({
        Cards: appUrl + '/cards/:deckId'
    });

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
        },
        getCards: function (deckId) {
            return doAjaxWithErrorHandler($.ajax(
                serverStates('Cards', {deckId: deckId})));
        }
    };

    function doAjaxWithErrorHandler(deferred) {
        return Q(deferred).catch(function (error) {
            console.err('An error occurred communicating with the server');
        });
    }
});
