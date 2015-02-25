define('server', ['fermat'], function (fermat) {
    var appUrl = ''; //window.location.protocol.indexOf("file") > -1  || window.location.host.indexOf('localhost') > -1 ? 'http://localhost:11285' : 'http://studynotesapi.azurewebsites.net';
    var serverStates = fermat({
        Cards: appUrl + '/cards/:deckId',
        'Card/Result': appUrl + '/card/:cardId/result/:result',
        Sync: appUrl + '/sync/:deckId',
        'Deck/Name': appUrl + '/deck/:deckId/name'
    });

    function ajaxPostOptions(data) {
        return {
            contentType: 'application/json',
            type: 'POST',
            data: JSON.stringify(data)
        };
    }

    function mapSerializedTuple(keyNames) {
        return function (tuple) {
            var o = {};
            keyNames.forEach(function (key,i) {
                o[key] = tuple['item' + (i+1)];
            });
            return o;
        };
    }

    function mapSerializedTuples(keyNames, tuples) {
        return tuples.map(mapSerializedTuple(keyNames))
    }

    return {
        sync: function (deckId) {
            return doAjaxWithErrorHandler($.ajax(
                serverStates('Sync', {deckId:deckId}), 
                ajaxPostOptions({})
            ));
        },
        authenticate: function (accessToken) {
            return doAjaxWithErrorHandler($.ajax(
                appUrl + '/auth', 
                ajaxPostOptions({ accessToken: accessToken })
            ));
        },
        importGitWiki: function (url) {
            return doAjaxWithErrorHandler($.ajax(
                appUrl + '/import', ajaxPostOptions({url:url})));
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
            )).then(mapSerializedTuples.bind(null, ['deck', 'count']));
        },
        getCards: function (deckId) {
            return doAjaxWithErrorHandler($.ajax(
                serverStates('Cards', {deckId: deckId})));
        },
        submitEasyResult: function (cardId) {
            $.ajax(serverStates('Card/Result', {cardId:cardId, result:'easy'}), {
                type: 'POST'
            });
        },
        submitHardResult: function (cardId) {
            $.ajax(serverStates('Card/Result', {cardId:cardId, result:'hard'}), {
                type: 'POST'
            });
        },
        changeDeckName: function (deckId, name) {
            return doAjaxWithErrorHandler($.ajax(serverStates('Deck/Name',{deckId:deckId}), ajaxPostOptions({ name: name })));
        }
    };

    function doAjaxWithErrorHandler(deferred) {
        return Q(deferred).catch(function (httpObj) {
            if (httpObj.status == 401) {
                return;
            } else {
                console.err('An error occurred communicating with the server - ' + httpObj.statusText);
            }
        });
    }
});
