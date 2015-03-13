define(
    'app',
    ['server', 'euclid', 'components','auth'],
    function (server, euclid, components, auth) {

    $.ajaxSetup({
        statusCode: {
            401: function(){                
                window.location.href = '/login';
            }
        },
        cache: false
    });
    $(document).ajaxStart(function() {
        NProgress.start();
    });
    $(document).ajaxStop(function() {
        NProgress.done();
    });
    $(document).ajaxError(function(e, jqxhr, settings, thrownError) {
        toastr.error('An error occurred during communication with the server');
    });
    window.onerror = function(msg, url, line, col, error) {
       toastr.error(msg, 'An error occurred'); 
    };

    function logoutChanges() {
        $('.anon-menu-item').show();
        $('.authed-menu-item').hide();
    }

    function loginChanges() {
        $('.anon-menu-item').hide();
        $('.authed-menu-item').show();
    }

    euclid.start([{
        title: 'Home',        
        entry: function () {
            return server.getDecks().then(function (decks) {
                loginChanges();
                var data = {decks: decks};
                return [components.Home(data), data];
            }, function () {
                logoutChanges();
                return [components.NotAuthenticated(), {}];
            });
        },
        actions: {
            importDemo: function () {
                var props = this, 
                            url = 'https://github.com/liammclennan/maths.wiki.git';
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
            logoutChanges();
            var data = {};
            return [components.LoginPage(data), data];
        },
        actions: {
            login: function (email) {
                var props = this;
                return server.login(email).then(function () {
                    props.message = "A login email has been sent to your email address " + email + '. Check your email and follow the login link.';
                    return props;
                });
            }
        }
    },
    {
        title: 'Import',        
        entry: function () {
            return [components.Import(), {}];
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
        title: 'Not Authenticated',
        entry: function () {
            if (false) return ['Home',{}];
            return [components.NotAuthenticated(), {}];
        },
        actions: {}
    },
    {
        title: 'Get Started',
        entry: function () {
            return [components.GetStarted(), {}];
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
            },
            sync: function (deckId) {
                server.sync(deckId).then(function () {
                    euclid.action('loadCards');
                }.bind(this));
            },
            viewNotebook: function () {
                if (this.deck.sourceUrl.indexOf('bitbucket') > -1) {
                    window.location.href = this.deck.sourceUrl;
                }
                if (this.deck.sourceUrl.indexOf('github') > -1) {
                    // urls of the form https://github.com/liammclennan/PostgresDoc.wiki.git
                    var repoSeparatorIndex = this.deck.sourceUrl.lastIndexOf('/', this.deck.sourceUrl.length-2);
                    var prefix = this.deck.sourceUrl.slice(0, repoSeparatorIndex);
                    var suffixComponents = this.deck.sourceUrl.slice(repoSeparatorIndex + 1).split('.');
                    window.location.href = prefix + '/' + suffixComponents[0] + '/wiki';
                }
            },
            saveNameChange: function (name) {
                server.changeDeckName(this.deck.id, name);
                return this;
            }
        }
    },
    {
        title: 'Help',
        entry: function () {
            var data = {};
            return [components.Help(data), data];
        }
    },
    {
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
        'Import': '/import',
        'Deck': '/deck/:url',
        'Deck/Study': '/deck/study/:deckId/:urlEncoded',
        'Login':'/login',
        'Not Authenticated': '/notauthenticated',
        'Get Started': '/getstarted',
        'Help': '/help'
    });
});

