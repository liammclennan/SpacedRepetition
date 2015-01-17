define('euclid', [], function () {
    var euclid = {
        actions: {},
        rootElement: {},
        rootProps: {},
        rootComponent: {},
        start: function (routes, mountPoint) {
            routes.forEach(register);

            function register(route) {
                page(route.route, function (context, next) {
                    var startData = route.entry(context.params);  // todo: forward route params
                    if (!Array.isArray(startData) || startData.length != 2 || !startData[0] || !startData[1]) {
                        console.error("A route's entry function needs to return an array containing a react component and it's props");
                        return;
                    }
                    euclid.rootElement = startData[0];
                    euclid.rootProps = startData[1];
                    euclid.actions = route.actions || {};
                    euclid.title = route.title || "";
                    euclid.rootComponent = React.render(euclid.rootElement, mountPoint);
                });
            }
            page();
            return euclid;
        },
        action: function (name) {
            var args = Array.prototype.slice.call(arguments, 1);
            args.unshift(euclid.rootProps);
            var newProps = euclid.actions[name].apply(this, args);
            euclid.rootComponent.setProps(newProps);
        }
    };
    return euclid;
});
