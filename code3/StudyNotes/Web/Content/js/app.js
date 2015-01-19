define(
    'app',
    ['server', 'euclid', 'components'],
    function (server, euclid, components) {
    
    euclid.start([{
        title: 'Home',
        route: '/',
        entry: function () {
            return [components.Home(null), null];
        },
        actions: {
            importWiki: function (props, url) {
                server.importGitWiki(url).then(function () {
                    page('/deck/' + btoa(url));
                });

                return props;
            },
            returnToWiki: function (props, url) { }
        }
    }, {
        title: 'Deck',
        route: '/deck/:url',
        entry: function (params) {
            var url = atob(params.url);
            var data = { url: url };
            return server.getDeck(url).then(function (deck) {
                console.dir(deck);
                return [components.Import(data), data];
            });
        },
        actions: {
        }
    }], document.getElementById('app'));
});

