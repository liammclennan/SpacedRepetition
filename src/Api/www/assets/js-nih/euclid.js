﻿define('euclid', ['fermat'], function (fermat) {
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
            this.state = fermat(states);
            this.router = new Router().init('/');
            routes.forEach(register);

            // flatiron does not seem to detect initial urls
            if (window.location.hash) {
                $(window).trigger('hashchange')
            }
            return euclid;

            function register(route) {
                var path = euclid.state(route.state || route.title);
                euclid.router.on(path, function () {
                    Q(route.entry.apply(null, arguments)).then(function (startData) {
                        if (!Array.isArray(startData) || startData.length != 2 || !startData[0]) {
                            console.error("A route's entry function needs to return an array containing a react component and it's props");
                            return;
                        }
                        if (typeof startData[0] == "string") {
                            euclid.navigate.apply(euclid, startData);
                            return;
                        }
                        startData[1] = startData[1] || {};
                        euclid.rootElement = startData[0];
                        euclid.rootProps = startData[1];
                        euclid.actions = route.actions || {};
                        euclid.title = route.title || "";
                        euclid.rootComponent = React.render(euclid.rootElement, mountPoint);
                        $('form:not(.filter) :input:visible:enabled:first').focus()
                    }).done();
                });
            }
        },
        action: function (name) {
            var args = Array.prototype.slice.call(arguments, 1);
            Q(euclid.actions[name].apply(euclid.rootProps, args)).then(function (newProps) {
                euclid.rootComponent.setProps(newProps);
            }).done();
        },
        navigate: function (state, components, message) {
            if (message) {
                toastr.info(message);
            }
            window.location.hash = this.state(state, components);
        }
    };
    return euclid;
});
