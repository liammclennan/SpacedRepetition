(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define([], factory);
    } else if (typeof exports === 'object') {
        // Node, CommonJS-like
        module.exports = factory();
    } else if (typeof define == 'function' && typeof require == 'function') {
        define('fermat',[], factory);
    }   
    else {
        // Browser globals (root is window)
        root.fermat = factory();
    }
}(this, function () {
    // build a url, by mapping url components onto a state. e.g.
    // Deck: '/deck/:url'
    /// state('Deck', { url: 'foo'});
    // --> /deck/foo
    return function (statemap) {
        return function (state, components) {
            var pattern = statemap[state];
            if (!pattern) {
                throw new Error('Unknown state ' + state);
            }
            if (!components) {
                return pattern;
            }
            return Array.prototype.reduce.call(Object.keys(components), function (prev,curr) {
                return prev.replace(':'+curr, components[curr]);
            }, pattern);
        }
    }
}));