define('euclid', [], function () {
    if (!Router) {
        console.error("Euclid is missing required dependency Flatiron Director - https://github.com/flatiron");
        return;
    }
    var euclid = {
        actions: {},
        rootElement: {},
        rootProps: {},
        rootComponent: {},
        start: function (routes, mountPoint, states) {
            this.states = states;
            this.router = new Router().init('/');
            routes.forEach(register);

            // flatiron does not seem to detect initial urls
            if (window.location.hash) {
                $(window).trigger('hashchange')
            }
            return euclid;

            function register(route) {
                var path = euclid.states[route.state || route.title];
                euclid.router.on(path, function () {
                    Q(route.entry.apply(null, arguments)).then(function (startData) {
                        if (!Array.isArray(startData) || startData.length != 2 || !startData[0]) {
                            console.error("A route's entry function needs to return an array containing a react component and it's props");
                            return;
                        }
                        startData[1] = startData[1] || {};
                        euclid.rootElement = startData[0];
                        euclid.rootProps = startData[1];
                        euclid.actions = route.actions || {};
                        euclid.title = route.title || "";
                        euclid.rootComponent = React.render(euclid.rootElement, mountPoint);
                    });
                });
            }
        },
        action: function (name) {
            var args = Array.prototype.slice.call(arguments, 1);
            Q(euclid.actions[name].apply(euclid.rootProps, args)).then(function (newProps) {
                euclid.rootComponent.setProps(newProps);
            });
        },
        navigate: function (state, components) {
            window.location.hash = this.state(state, components);
        },
        // build a url, by mapping url components onto a state. e.g.
        // Deck: '/deck/:url'
        /// state('Deck', { url: 'foo'});
        // --> /deck/foo
        state: function (state, components) {
            var pattern = this.states[state];
            if (!pattern) {
                throw new Error('Unknown state ' + state);
            }
            return Array.prototype.reduce.call(Object.keys(components), function (prev,curr) {
                return prev.replace(':'+curr, components[curr]);
            }, pattern);
        }
    };
    return euclid;
});
