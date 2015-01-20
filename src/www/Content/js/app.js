define(
    'app',
    ['server', 'euclid', 'components'],
    function (server, euclid, components) {
    
    euclid.start([{
        title: 'Home',        
        entry: function () {
            return server.getDecks().then(function (decks) {
                var data = {decks: decks};
                return [components.Home(data), data];
            });
        },
        actions: {
            importWiki: function (props, url) {
                return server.importGitWiki(url).then(function () {
                    euclid.navigate('/deck/' + encodeURIComponent(btoa(url)));
                    return props;
                });
            }
        }
    }, {
        title: 'Deck',
        entry: function (urlEncoded) {
            var url = atob(decodeURIComponent(urlEncoded));
            
            return server.getDeck(url).then(function (deck) {                
                return [components.Deck(deck), deck];
            });
        },
        actions: {
        }
    }], document.getElementById('app'), {
        'Home': '/',
        'Deck': '/deck/:url'
    });
});

