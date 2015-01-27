define(
    'app',
    ['server', 'euclid', 'components','auth'],
    function (server, euclid, components, auth) {

    $.ajaxSetup({
        statusCode: {
            401: function(){
                euclid.navigate('Login');
            }
        },
        headers: {
            'Authorization': localStorage.getItem('nancyToken') ? localStorage.getItem('nancyToken') : ''
        }
    }); 
    
    
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
                    euclid.navigate('Deck', {url: encodeURIComponent(btoa(url))});
                    return props;
                });
            }
        }
    },
    {
        title: 'Login',        
        entry: function () {
            var data = {};
            return [components.Login(), data];
        },
        actions: {
        }
    },
    {
        title: 'Deck',
        entry: function (urlEncoded) {
            var url = atob(decodeURIComponent(urlEncoded));
            
            return server.getDeck(url).then(function (deck) { 
                var data = {
                    deck:deck,
                    cards: [],
                    deckUrlEncoded: urlEncoded
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
                euclid.navigate('Deck/Study', {deckId:deckId,urlEncoded:this.deckUrlEncoded});
                return this;
            }
        }
    }, {
        title: 'Study',
        state: 'Deck/Study',
        entry: function (deckId, urlEncoded) {
            var data = {};
            return server.getCards(deckId).then(function (cards) {
                data.cards = cards;
                data.deckId = deckId;
                data.index = 0;
                data.urlEncoded = urlEncoded;
                if (cards.length == 0) {
                    euclid.navigate('Deck', {url: urlEncoded}, 'There are no cards due');
                    return [components.Study(data), data];
                }
                return [components.Study(data), data];
            });
        },
        actions: (function () {
            function incrementIndex() {
                if (this.index + 1 == this.cards.length) {
                    toastr.info('Deck finished');
                    euclid.navigate('Deck', {url: this.urlEncoded});
                }
                this.index = this.index + 1;
            }

            return {
                cardWasHard: function (cardId) {
                    server.submitHardResult(cardId);
                    incrementIndex.call(this);
                    return this;
                },
                cardWasEasy: function (cardId) {
                    server.submitEasyResult(cardId);
                    incrementIndex.call(this);
                    return this;
                }
            };
        })() 
    }], document.getElementById('app'), {
        'Home': '/',
        'Deck': '/deck/:url',
        'Deck/Study': '/deck/study/:deckId/:urlEncoded',
        'Login': '/login'
    });
});

