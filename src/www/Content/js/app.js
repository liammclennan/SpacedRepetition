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
            },
            study: function (deckId) {
                euclid.navigate('Deck/Study', {deckId:deckId});
                return this;
            }
        }
    }, {
        title: 'Study',
        state: 'Deck/Study',
        entry: function (deckId) {
            var data = {};
            return server.getCards(deckId).then(function (cards) {
                data.cards = cards;
                return [components.Study(data), data];
            });
        },
        actions: {}
    }], document.getElementById('app'), {
        'Home': '/',
        'Deck': '/deck/:url',
        'Deck/Study': '/deck/study/:deckId'
    });
});

