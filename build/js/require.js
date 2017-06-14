/**
@author Chris Humboldt
**/
// Extend Rocket
Rocket.defaults.require = {
    errors: true,
    rootPath: './node_modules/'
};
// Load main file (if provided)
function RockMod_RequireLoadMain() {
    var loadMainScript = document.querySelector('script[data-main]');
    if (loadMainScript) {
        var mainFile = loadMainScript.getAttribute('data-main');
        if (Rocket.is.string(mainFile) && mainFile.length > 0) {
            var customPath = (mainFile.substring(0, 2) === '~/') ? Rocket.defaults.rootPath : './';
            RockMod_Require.load(mainFile, false, customPath);
        }
    }
}
;
// Rocket module
var RockMod_Module;
(function (RockMod_Module) {
    // Variables
    var listModules = {};
    // Functions
    /*
    All module related methods go here. Makes it easier to manage,
    especially within Typescript.
    */
    var moduleMethods = {
        add: function (obj) {
            // Catch
            if (!Rocket.is.object(obj)) {
                return false;
            }
            // Continue
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    if (validate.module(key, obj[key])) {
                        listModules[key] = {
                            loaded: false,
                            loading: false
                        };
                        if (Rocket.is.string(obj[key].css) || Rocket.is.array(obj[key].css)) {
                            listModules[key].css = moduleMethods.sanitisePaths(obj[key].css);
                        }
                        if (Rocket.is.string(obj[key].js) || Rocket.is.array(obj[key].js)) {
                            listModules[key].js = moduleMethods.sanitisePaths(obj[key].js);
                        }
                        if (Rocket.is.array(obj[key].requires)) {
                            listModules[key].requires = obj[key].requires;
                        }
                    }
                }
            }
        },
        dependencies: function (name) {
            // Catch
            if (!Rocket.is.string(name)) {
                return false;
            }
            // Continue
            var dependencies = [];
            // Functions
            function checkModule(name) {
                if (moduleMethods.exists(name)) {
                    dependencies.push(name);
                    var thisModule = listModules[name];
                    if (Rocket.is.array(thisModule.requires)) {
                        for (var _i = 0, _a = thisModule.requires; _i < _a.length; _i++) {
                            var moduleName = _a[_i];
                            if (dependencies.indexOf(moduleName) > -1) {
                                if (Rocket.defaults.require.errors) {
                                    throw new Error('ROCKET REQUIRE: You have a dependency loop with module: ' + name);
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
            // Execute
            checkModule(name);
            return dependencies;
        },
        exists: function (name) {
            // Catch
            if (!Rocket.is.string(name)) {
                return false;
            }
            // Continue
            return Rocket.exists(listModules[name]);
        },
        get: function (name) {
            // Catch
            if (!Rocket.is.string(name)) {
                return false;
            }
            // Continue
            return listModules[name];
        },
        isLoaded: function (name) {
            // Catch
            if (!Rocket.is.string(name)) {
                return false;
            }
            // Continue
            var thisModule = listModules[name];
            return (Rocket.is.object(thisModule)) ? thisModule.loaded : false;
        },
        isLoading: function (name) {
            // Catch
            if (!Rocket.is.string(name)) {
                return false;
            }
            // Continue
            var thisModule = listModules[name];
            return (Rocket.is.object(thisModule)) ? thisModule.loading : false;
        },
        listLoaded: function () {
            var listLoaded = [];
            for (var key in listModules) {
                if (listModules.hasOwnProperty(key) && listModules[key].loaded) {
                    listLoaded.push(key);
                }
            }
            return listLoaded;
        },
        remove: function (name) {
            // Catch
            if (!Rocket.is.string(name) || !Rocket.exists(listModules[name])) {
                return false;
            }
            // Continue
            delete listModules[name];
        },
        sanitisePaths: function (paths) {
            // Convert string to array
            if (Rocket.is.string(paths)) {
                paths = [paths];
            }
            // Set the root url if need be
            for (var len = paths.length, i = 0; i < len; i++) {
                paths[i] = paths[i].replace(/~\//g, Rocket.defaults.require.rootPath);
            }
            return paths;
        }
    };
    var validate = {
        module: function (name, obj) {
            var hasCSS = false;
            var hasJS = false;
            var hasRequires = false;
            if (!Rocket.is.string(name)) {
                return false;
            }
            if (!Rocket.is.object(obj)) {
                return false;
            }
            if (!Rocket.exists(obj.css) && !Rocket.exists(obj.js)) {
                return false;
            }
            if ((Rocket.is.string(obj.css) || Rocket.is.array(obj.css) && obj.css.length > 0)) {
                hasCSS = true;
            }
            if ((Rocket.is.string(obj.js) || Rocket.is.array(obj.js) && obj.js.length > 0)) {
                hasJS = true;
            }
            if (Rocket.is.array(obj.requires) && obj.requires.length > 0) {
                hasRequires = true;
            }
            if (!hasCSS && !hasJS && !hasRequires) {
                return false;
            }
            return true;
        }
    };
    // Exports
    RockMod_Module.add = moduleMethods.add;
    RockMod_Module.exists = moduleMethods.exists;
    RockMod_Module.get = moduleMethods.get;
    RockMod_Module.isLoaded = moduleMethods.isLoaded;
    RockMod_Module.isLoading = moduleMethods.isLoading;
    RockMod_Module.dependencies = moduleMethods.dependencies;
    RockMod_Module.list = listModules;
    RockMod_Module.loaded = moduleMethods.listLoaded;
    RockMod_Module.remove = moduleMethods.remove;
})(RockMod_Module || (RockMod_Module = {}));
// Rocket require
var RockMod_Require;
(function (RockMod_Require) {
    // Functions
    function loadFile(file, callback, customRootPath) {
        var theInclude;
        var type;
        var rootUrl = (Rocket.is.string(customRootPath)) ? customRootPath : '';
        var filePath = (Rocket.is.url(file)) ? file : rootUrl + file;
        // Create include element
        if (/(.css)$/.test(file)) {
            type = 'css';
            theInclude = document.createElement('link');
            theInclude.rel = 'stylesheet';
            theInclude.href = filePath;
        }
        else if (/(.js)$/.test(file)) {
            type = 'js';
            theInclude = document.createElement('script');
            theInclude.setAttribute('async', true);
            theInclude.src = filePath;
        }
        // Listen for completion
        theInclude.onload = function () {
            if (type !== 'js' && Object.hasOwnProperty.call(window, "ActiveXObject") && !window['ActiveXObject']) {
                if (Rocket.is.function(callback)) {
                    return callback(false);
                }
            }
            if (Rocket.is.function(callback)) {
                return callback(true);
            }
        };
        theInclude.onreadystatechange = function () {
            if (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete') {
                this.onreadystatechange = null;
                if (type === 'js' && Rocket.is.function(callback)) {
                    return callback(false);
                }
                if (Rocket.is.function(callback)) {
                    return callback(true);
                }
            }
        };
        theInclude.onerror = function () {
            if (Rocket.is.function(callback)) {
                return callback(false);
            }
        };
        document.getElementsByTagName('head')[0].appendChild(theInclude);
    }
    // Load module files
    function loadModuleFiles(thisModule, callback) {
        var count = 0;
        var files = [];
        // CSS
        if (Rocket.is.string(thisModule.css)) {
            files.push(thisModule.css);
        }
        else if (Rocket.is.array(thisModule.css) && thisModule.css.length > 0) {
            files = files.concat(thisModule.css);
        }
        // JS
        if (Rocket.is.string(thisModule.js)) {
            files.push(thisModule.js);
        }
        else if (Rocket.is.array(thisModule.js) && thisModule.js.length > 0) {
            files = files.concat(thisModule.js);
        }
        // Count
        count = files.length;
        // Execute
        // Catch
        if (count < 1) {
            return callback();
        }
        // Continue
        for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
            var file = files_1[_i];
            loadFile(file, function (response) {
                count--;
                if (count === 0) {
                    thisModule.loaded = true;
                    return callback();
                }
            }, false);
        }
    }
    // Require instance
    /*
    Self contain the require so that each instance has its own scope.
    */
    var Require = (function () {
        function Require() {
            this.modules = [];
        }
        // Functions
        Require.prototype.add = function (name) {
            // Check
            if (!Rocket.is.string(name)
                || !Rocket.module.exists(name)
                || Rocket.module.isLoaded(name)
                || this.modules.indexOf(name) > -1) {
                return false;
            }
            // Continue
            this.modules = this.modules.concat(Rocket.module.dependencies(name));
            this.modules = Rocket.array.unique(this.modules);
        };
        /*
        The load function will take the newly created require instance and execute
        the loading of each module in the various dependency stacks.
        */
        Require.prototype.load = function (callback) {
            // Variables
            var self = this;
            // Functions
            function loadExecute() {
                loadModules(self.modules, function () {
                    self.modules = [];
                    if (Rocket.is.function(callback)) {
                        return callback();
                    }
                });
            }
            function loadModule(name, callback) {
                /*
                Check to see if the module exists. Rocket require is explicit and will
                hard fail should a module not be found. This is to protect against lazy
                module management.
                */
                if (!Rocket.module.exists(name)) {
                    if (Rocket.defaults.require.errors) {
                        throw new Error('ROCKET REQUIRE: You are missing a required module: ' + name);
                    }
                }
                else {
                    var thisModule_1 = Rocket.module.get(name);
                    /*
                    Here we find that the module is already loaded or loading.
                    Return the callback and move on as needed.
                    */
                    if (thisModule_1.loaded || thisModule_1.loading) {
                        if (thisModule_1.loaded) {
                            return callback();
                        }
                        else {
                            // Poll the variable once loaded
                            var modIntervalCheck_1 = setInterval(function () {
                                if (thisModule_1.loaded) {
                                    clearInterval(modIntervalCheck_1);
                                    return callback();
                                }
                            }, 10);
                        }
                    }
                    else {
                        var dependencies = (Rocket.is.array(thisModule_1.requires) && thisModule_1.requires.length > 0) ? thisModule_1.requires : false;
                        // Change state to loading
                        thisModule_1.loading = true;
                        // Check dependency
                        if (!dependencies) {
                            return loadModuleFiles(thisModule_1, callback);
                        }
                        else {
                            loadModules(dependencies, function () {
                                return loadModuleFiles(thisModule_1, callback);
                            });
                        }
                    }
                }
            }
            function loadModules(modules, callback) {
                var count = modules.length;
                for (var _i = 0, modules_1 = modules; _i < modules_1.length; _i++) {
                    var thisModule = modules_1[_i];
                    loadModule(thisModule, function () {
                        count--;
                        if (count === 0) {
                            return callback();
                        }
                    });
                }
            }
            // Execute
            loadExecute();
        };
        return Require;
    }());
    RockMod_Require.newRequire = Require;
    RockMod_Require.load = loadFile;
})(RockMod_Require || (RockMod_Require = {}));
// Bind to the Rocket object
Rocket.module = RockMod_Module;
Rocket.require = function () {
    return new RockMod_Require.newRequire;
};
// Load main file
RockMod_RequireLoadMain();
