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
            importWiki: function (url) {
                var props = this;
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
                var data = {
                    deck:deck,
                    cards: []
                };       
                return [components.Deck(data), data];
            });
        },
        actions: {
            loadCards: function () {
                return server.getCards(this.deck.id).then(function (cards) {
                    this.cards = cards;
                    return this;
                }.bind(this));
            }
        }
    }], document.getElementById('app'), {
        'Home': '/',
        'Deck': '/deck/:url'
    });
});

