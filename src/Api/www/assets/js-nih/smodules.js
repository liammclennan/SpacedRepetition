(function (root) {

    // declare a module and its dependencies
    root.define = function define(name, dependencies, moduleFactory) {
        root.amdModules = root.amdModules || {};

        if (!isArray(dependencies) && typeof dependencies !== 'function') {
            throw new Error('dependencies must be an array. moduleFactory must be a function.');
        }

        root.amdModules[name] = {
            moduleFactory: moduleFactory || dependencies,
            dependencies: typeof (moduleFactory) === 'undefined' ? [] : dependencies
        };
    };

    // build a module and its dependencies. Modules are cached. 
    root.require = function require(name) {
        var module = root.amdModules[name],
              deps = [];
        if (typeof module === 'undefined') {
            throw "Module " + name + " could not be found";
        }
        if (module.cached) return module.cached;

        for (var i = 0; i < module.dependencies.length; i++) {
            deps.push(require(module.dependencies[i]));
        }

        module.cached = module.moduleFactory.apply(this, deps);
        return module.cached;
    };

    root.requireTest = function requireTest(name, overrides) {
        var module = root.amdModules[name],
              deps = [];
        if (typeof module === 'undefined') {
            throw "Module " + name + " could not be found";
        }
        
        for (var i = 0; i < module.dependencies.length; i++) {
            if (overrides[module.dependencies[i]]) {
                deps.push(overrides[module.dependencies[i]]);
            } else {
                deps.push(require(module.dependencies[i]));
            }
        }
        return module.moduleFactory.apply(this, deps);
    };
    
    function isArray(o) {
        return Array.isArray ? Array.isArray(o) :toString.call(o) === '[object Array]';
    }

})(window);
