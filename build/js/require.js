'user strict';
var Rocket = (typeof Rocket === 'object') ? Rocket : {};
if (!Rocket.defaults) {
    Rocket.defaults = {};
}
Rocket.defaults.require = {
    errors: true,
    rootUrl: './node_modules/'
};
var RockMod_Module;
(function (RockMod_Module) {
    var listModules = {};
    var listLoaded = [];
    var moduleMethods = {
        add: function (obj) {
            if (!validate.module(obj)) {
                return false;
            }
            listModules[obj.name] = {
                loaded: false
            };
            if (typeof obj.css === 'string' || isArrayCheck(obj.css)) {
                listModules[obj.name].css = obj.css;
            }
            if (typeof obj.js === 'string' || isArrayCheck(obj.js)) {
                listModules[obj.name].js = obj.js;
            }
            if (RockMod_Module.isArray(obj.requires)) {
                listModules[obj.name].requires = obj.requires;
            }
        },
        exists: function (name) {
            if (typeof name !== 'string') {
                return false;
            }
            return (typeof listModules[name] === 'undefined') ? false : true;
        },
        get: function (name) {
            if (this.exists(name)) {
                return listModules[name];
            }
        },
        isLoaded: function (name) {
            if (typeof name !== 'string') {
                return false;
            }
            return (listLoaded.indexOf(name) < 0) ? false : true;
        },
        dependencies: function (name) {
            if (typeof name !== 'string') {
                return false;
            }
            var dependencies = [];
            function checkModule(name) {
                if (moduleMethods.exists(name)) {
                    dependencies.push(name);
                    var thisModule = listModules[name];
                    if (isArrayCheck(thisModule.requires)) {
                        for (var _i = 0, _a = thisModule.requires; _i < _a.length; _i++) {
                            var moduleName = _a[_i];
                            if (dependencies.indexOf(moduleName) > -1) {
                                if (Rocket.defaults.require.errors) {
                                    throw new Error('Rocket Require: You have a dependency loop with module: ' + name);
                                }
                                else {
                                    return false;
                                }
                            }
                            checkModule(moduleName);
                        }
                    }
                }
            }
            ;
            checkModule(name);
            return dependencies;
        },
        remove: function (name) {
            if (typeof name !== 'string' || listModules[name] === 'undefined') {
                return false;
            }
            delete listModules[name];
        }
    };
    var validate = {
        module: function (obj) {
            var hasCSS = false;
            var hasJS = false;
            var hasRequires = false;
            if (typeof obj !== 'object') {
                return false;
            }
            if (typeof obj.name !== 'string') {
                return false;
            }
            if (typeof obj.css === 'undefined' && typeof obj.js === 'undefined') {
                return false;
            }
            if ((typeof obj.css === 'string' || isArrayCheck(obj.css)) && obj.css.length > 0) {
                hasCSS = true;
            }
            if ((typeof obj.js === 'string' || isArrayCheck(obj.js)) && obj.js.length > 0) {
                hasJS = true;
            }
            if (isArrayCheck(obj.requires) && obj.requires.length > 0) {
                hasRequires = true;
            }
            if (!hasCSS && !hasJS && !hasRequires) {
                return false;
            }
            return true;
        }
    };
    function isArrayCheck(check) {
        return (typeof check === 'object' && check instanceof Array) ? true : false;
    }
    RockMod_Module.add = moduleMethods.add;
    RockMod_Module.exists = moduleMethods.exists;
    RockMod_Module.get = moduleMethods.get;
    RockMod_Module.isArray = isArrayCheck;
    RockMod_Module.isLoaded = moduleMethods.isLoaded;
    RockMod_Module.dependencies = moduleMethods.dependencies;
    RockMod_Module.list = listModules;
    RockMod_Module.loaded = listLoaded;
    RockMod_Module.remove = moduleMethods.remove;
})(RockMod_Module || (RockMod_Module = {}));
var RockMod_Require;
(function (RockMod_Require) {
    var modules = [];
    function loadFile(file, callback) {
        var theInclude;
        var type;
        if (/(.css)$/.test(file)) {
            type = 'css';
            theInclude = document.createElement('link');
            theInclude.rel = 'stylesheet';
            theInclude.href = Rocket.defaults.require.rootUrl + file;
        }
        else if (/(.js)$/.test(file)) {
            type = 'js';
            theInclude = document.createElement('script');
            theInclude.setAttribute('async', true);
            theInclude.src = Rocket.defaults.require.rootUrl + file;
        }
        theInclude.onload = function () {
            if (type !== 'js' && Object.hasOwnProperty.call(window, "ActiveXObject") && !window['ActiveXObject']) {
                return callback(false);
            }
            return callback(true);
        };
        theInclude.onreadystatechange = function () {
            if (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete') {
                this.onreadystatechange = null;
                if (type === 'js') {
                    return callback(false);
                }
                return callback(true);
            }
        };
        theInclude.onerror = function () {
            return callback(false);
        };
        document.getElementsByTagName('head')[0].appendChild(theInclude);
    }
    ;
    function loadModuleFiles(name, thisModule, callback) {
        var count = 0;
        var files = [];
        if (typeof thisModule.css === 'string') {
            files.push(thisModule.css);
        }
        else if (Rocket.module.isArray(thisModule.css) && thisModule.css.length > 0) {
            files = files.concat(thisModule.css);
        }
        if (typeof thisModule.js === 'string') {
            files.push(thisModule.js);
        }
        else if (Rocket.module.isArray(thisModule.js) && thisModule.js.length > 0) {
            files = files.concat(thisModule.js);
        }
        count = files.length;
        if (count < 1) {
            return callback(false);
        }
        for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
            var file = files_1[_i];
            loadFile(file, function (response) {
                count--;
                if (count === 0) {
                    if (response) {
                        Rocket.module.loaded.push(name);
                    }
                    modules.splice(modules.indexOf(name), 1);
                    return callback(true);
                }
            });
        }
    }
    ;
    function initialise(names, callback) {
        if (!Rocket.module.isArray(names)) {
            return false;
        }
        function loadModules(names, callback) {
            var _loop_1 = function (name_1) {
                if (!Rocket.module.isLoaded(name_1) && Rocket.module.exists(name_1)) {
                    var thisModule_1 = Rocket.module.get(name_1);
                    var dependencies = (Rocket.module.isArray(thisModule_1.requires) && thisModule_1.requires.length > 0) ? thisModule_1.requires : false;
                    if (!thisModule_1.loaded) {
                        thisModule_1.loaded = true;
                        if (!dependencies) {
                            loadModuleFiles(name_1, thisModule_1, function () {
                                callback();
                            });
                        }
                        else {
                            loadModules(dependencies, function () {
                                loadModuleFiles(name_1, thisModule_1, function () {
                                    callback();
                                });
                            });
                        }
                    }
                }
            };
            for (var _i = 0, names_1 = names; _i < names_1.length; _i++) {
                var name_1 = names_1[_i];
                _loop_1(name_1);
            }
        }
        ;
        function setModulesList() {
            for (var _i = 0, names_2 = names; _i < names_2.length; _i++) {
                var name_2 = names_2[_i];
                modules = modules.concat(Rocket.module.dependencies(name_2));
            }
            modules = modules.filter(function (value, index, self) {
                return self.indexOf(value) === index;
            });
        }
        setModulesList();
        loadModules(names, function () {
            if (modules.length === 0) {
                return callback(true);
            }
        });
    }
    RockMod_Require.init = initialise;
})(RockMod_Require || (RockMod_Require = {}));
Rocket.module = RockMod_Module;
Rocket.require = RockMod_Require.init;
