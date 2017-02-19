Rocket.defaults.require = {
    errors: true,
    rootPath: './node_modules/'
};
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
var RockMod_Module;
(function (RockMod_Module) {
    var listModules = {};
    var moduleMethods = {
        add: function (obj) {
            if (!Rocket.is.object(obj)) {
                return false;
            }
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    if (validate.module(key, obj[key])) {
                        listModules[key] = {
                            loaded: false
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
            if (!Rocket.is.string(name)) {
                return false;
            }
            var dependencies = [];
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
            checkModule(name);
            return dependencies;
        },
        exists: function (name) {
            if (!Rocket.is.string(name)) {
                return false;
            }
            return Rocket.exists(listModules[name]);
        },
        get: function (name) {
            if (!Rocket.is.string(name)) {
                return false;
            }
            return listModules[name];
        },
        isLoaded: function (name) {
            if (!Rocket.is.string(name)) {
                return false;
            }
            var thisModule = listModules[name];
            return (Rocket.is.object(thisModule)) ? thisModule.loaded : false;
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
            if (!Rocket.is.string(name) || !Rocket.exists(listModules[name])) {
                return false;
            }
            delete listModules[name];
        },
        sanitisePaths: function (paths) {
            if (Rocket.is.string(paths)) {
                paths = [paths];
            }
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
    RockMod_Module.add = moduleMethods.add;
    RockMod_Module.exists = moduleMethods.exists;
    RockMod_Module.get = moduleMethods.get;
    RockMod_Module.isLoaded = moduleMethods.isLoaded;
    RockMod_Module.dependencies = moduleMethods.dependencies;
    RockMod_Module.list = listModules;
    RockMod_Module.loaded = moduleMethods.listLoaded;
    RockMod_Module.remove = moduleMethods.remove;
})(RockMod_Module || (RockMod_Module = {}));
var RockMod_Require;
(function (RockMod_Require) {
    function loadFile(file, thisCallback, customRootPath) {
        var callback = (Rocket.is.function(thisCallback)) ? thisCallback : function () { };
        var theInclude;
        var type;
        var rootUrl = (Rocket.is.string(customRootPath)) ? customRootPath : '';
        var filePath = (Rocket.is.url(file)) ? file : rootUrl + file;
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
    function loadModuleFiles(name, thisModule, callback) {
        var count = 0;
        var files = [];
        if (Rocket.is.string(thisModule.css)) {
            files.push(thisModule.css);
        }
        else if (Rocket.is.array(thisModule.css) && thisModule.css.length > 0) {
            files = files.concat(thisModule.css);
        }
        if (Rocket.is.string(thisModule.js)) {
            files.push(thisModule.js);
        }
        else if (Rocket.is.array(thisModule.js) && thisModule.js.length > 0) {
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
                    return callback(true);
                }
            }, false);
        }
    }
    var Require = (function () {
        function Require() {
            this.modules = [];
        }
        Require.prototype.add = function (name) {
            if (!Rocket.is.string(name)
                || !Rocket.module.exists(name)
                || Rocket.module.isLoaded(name)
                || this.modules.indexOf(name) > -1) {
                return false;
            }
            this.modules = this.modules.concat(Rocket.module.dependencies(name));
            this.modules = Rocket.array.unique(this.modules);
        };
        Require.prototype.load = function (callback) {
            var self = this;
            var listModules = self.modules.reverse();
            var modulesCount = self.modulesCount;
            function loadExecute() {
                loadModules(listModules, function () {
                    self.modules = [];
                    if (Rocket.is.function(callback)) {
                        return callback();
                    }
                });
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
            function loadModule(name, callback) {
                if (!Rocket.module.exists(name)) {
                    if (Rocket.defaults.require.errors) {
                        throw new Error('ROCKET REQUIRE: You are missing a required module: ' + name);
                    }
                }
                else {
                    if (Rocket.module.isLoaded(name)) {
                        return callback();
                    }
                    else {
                        var thisModule_1 = Rocket.module.get(name);
                        var dependencies = (Rocket.is.array(thisModule_1.requires) && thisModule_1.requires.length > 0) ? thisModule_1.requires : false;
                        thisModule_1.loaded = true;
                        if (!dependencies) {
                            loadModuleFiles(name, thisModule_1, function () {
                                return callback();
                            });
                        }
                        else {
                            loadModules(dependencies, function () {
                                loadModuleFiles(name, thisModule_1, function () {
                                    return callback();
                                });
                            });
                        }
                    }
                }
            }
            function removeModule(name) {
                listModules.splice(listModules.indexOf(name), 1);
            }
            loadExecute();
        };
        return Require;
    }());
    RockMod_Require.newRequire = Require;
    RockMod_Require.load = loadFile;
})(RockMod_Require || (RockMod_Require = {}));
Rocket.module = RockMod_Module;
Rocket.require = function () {
    return new RockMod_Require.newRequire;
};
RockMod_RequireLoadMain();
