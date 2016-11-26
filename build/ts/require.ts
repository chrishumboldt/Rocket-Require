/**
* File: build/ts/require.ts
* Type: Typescript file
* Author: Chris Humboldt
**/

// Rocket module extension
// NOTE: You do not need Rocket for this module to be used.
// This allows you to extend Rocket or use independently. Both will work.
var Rocket = (typeof Rocket === 'object') ? Rocket : {};
if (!Rocket.defaults) {
   Rocket.defaults = {};
}
Rocket.defaults.require = {
   errors: true,
   rootUrl: './node_modules/'
};

// Interfaces
interface module {
   name:string;
   css:any;
   js:any;
   loaded:boolean;
   requires:string[];
}

// Load main file (if provided)
function RockMod_RequireLoadMain () {
   let loadMainScript = document.querySelector('script[data-main]');
   if (loadMainScript) {
      const mainFile = loadMainScript.getAttribute('data-main');
      if (typeof mainFile === 'string' && mainFile.length > 0) {
         RockMod_Require.load(mainFile, false, './');
      }
   }
};

// Rocket module
module RockMod_Module {
   // Variables
   let listModules:any = {};

   // Functions
   /*
   All module related methods go here. Makes it easier to manage,
   especially within Typescript.
   */
   let moduleMethods = {
      add: function (obj:module) {
         // Catch
         if (typeof obj !== 'object') {
            return false;
         }
         // Continue
         for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
               if (validate.module(key, obj[key])) {
                  listModules[key] = {
                     loaded: false
                  };
                  if (typeof obj[key].css === 'string' || isArrayCheck(obj[key].css)) {
                     listModules[key].css = obj[key].css;
                  }
                  if (typeof obj[key].js === 'string' || isArrayCheck(obj[key].js)) {
                     listModules[key].js = obj[key].js;
                  }
                  if (isArray(obj[key].requires)) {
                     listModules[key].requires = obj[key].requires;
                  }
               }
            }
         }
      },
      dependencies: function (name:string) {
         // Catch
         if (typeof name !== 'string') {
            return false;
         }
         // Continue
         var dependencies = [];

         // Functions
         function checkModule (name:string) {
            if (moduleMethods.exists(name)) {
               dependencies.push(name);
               let thisModule = listModules[name];
               if (isArrayCheck(thisModule.requires)) {
                  for (let moduleName of thisModule.requires) {
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
         };

         // Execute
         checkModule(name);
         return dependencies;
      },
      exists: function (name:string) {
         // Catch
         if (typeof name !== 'string') {
            return false;
         }
         // Continue
         return (typeof listModules[name] === 'undefined') ? false : true;
      },
      get: function (name:string) {
         if (typeof name !== 'string') {
            return false;
         }
         return listModules[name];
      },
      isLoaded: function (name:string) {
         // Catch
         if (typeof name !== 'string') {
            return false;
         }
         // Continue
         const thisModule = listModules[name];
         return (typeof thisModule === 'object') ? thisModule.loaded : false;
      },
      listLoaded: function () {
         let listLoaded:any = [];
         for (let key in listModules) {
            if (listModules.hasOwnProperty(key) && listModules[key].loaded) {
               listLoaded.push(key);
            }
         }
         return listLoaded;
      },
      remove: function (name:string) {
         // Catch
         if (typeof name !== 'string' || listModules[name] === 'undefined') {
            return false;
         }
         // Continue
         delete listModules[name];
      }
   };
   let validate = {
      module: function (name:string, obj:module) {
         let hasCSS = false;
         let hasJS = false;
         let hasRequires = false;
         if (typeof name !== 'string') {
            return false;
         }
         if (typeof obj !== 'object') {
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
   function isArrayCheck (check:any) {
      return (typeof check === 'object' && check instanceof Array) ? true : false;
   }

   // Exports
   export let add = moduleMethods.add;
   export let exists = moduleMethods.exists;
   export let get = moduleMethods.get;
   export let isArray = isArrayCheck;
   export let isLoaded = moduleMethods.isLoaded;
   export let dependencies = moduleMethods.dependencies;
   export let list = listModules;
   export let loaded = moduleMethods.listLoaded;
   export let remove = moduleMethods.remove;
}

// Rocket require
module RockMod_Require {
   // Functions
   function loadFile (file, thisCallback, customRootUrl:any) {
      let callback = (typeof thisCallback === 'function') ? thisCallback : function () {};
      let theInclude:any;
      let type;
      let rootUrl = (typeof customRootUrl === 'string') ? customRootUrl : Rocket.defaults.require.rootUrl;

      // Create include element
      if (/(.css)$/.test(file)) {
         type = 'css';
         theInclude = document.createElement('link');
         theInclude.rel = 'stylesheet';
         theInclude.href = rootUrl + file;
      }
      else if (/(.js)$/.test(file)) {
         type = 'js';
         theInclude = document.createElement('script');
         theInclude.setAttribute('async', true);
         theInclude.src = rootUrl + file;
      }

      // Listen for completion
      theInclude.onload = function () {
         if (type !== 'js' && Object.hasOwnProperty.call(window, "ActiveXObject") && !window['ActiveXObject']) {
            return callback(false);
         }
         return callback(true);
      };
      theInclude.onreadystatechange = function() {
         if (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete') {
            this.onreadystatechange = null;
            if (type === 'js') {
               return callback(false);
            }
            return callback(true);
         }
      };
      theInclude.onerror = function() {
         return callback(false);
      };

      document.getElementsByTagName('head')[0].appendChild(theInclude);
   }
   // Load module files
   function loadModuleFiles (name, thisModule, callback) {
      let count = 0;
      let files = [];

      // CSS
      if (typeof thisModule.css === 'string') {
         files.push(thisModule.css);
      }
      else if (Rocket.module.isArray(thisModule.css) && thisModule.css.length > 0) {
         files = files.concat(thisModule.css);
      }
      // JS
      if (typeof thisModule.js === 'string') {
         files.push(thisModule.js);
      }
      else if (Rocket.module.isArray(thisModule.js) && thisModule.js.length > 0) {
         files = files.concat(thisModule.js);
      }

      // Count
      count = files.length;

      // Execute
      // Catch
      if (count < 1) {
         return callback(false);
      }
      // Continue
      for (let file of files) {
         loadFile(file, function (response) {
            count--;
            if (count === 0) {
               return callback(true);
            }
         }, false);
      }
   }

   // Require instance
   /*
   Self contain the require so that each instance has its own scope.
   */
   class Require {
      modules:string[];
      constructor () {
         this.modules = [];
      }

      // Functions
      public add (name:string) {
         // Check
         if (typeof name !== 'string' || !Rocket.module.exists(name) || this.modules.indexOf(name) > -1) {
            return false;
         }
         // Continue
         this.modules = this.modules.concat(Rocket.module.dependencies(name));
         this.modules = this.modules.filter(function (value, index, self) {
            return self.indexOf(value) === index;
         });
      }

      /*
      The laod function will take the newly created require instance and execute
      the loading of each module in the various dependency stacks.
      */
      public load (callback:any) {
         // Variables
         let listModules = this.modules;

         // Functions
         function loadModules (names:string[], callback:any) {
            for (let name of names) {
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
                  /*
                  Here we find that the module is already loaded.
                  Return the callback and move on.
                  */
                  if (Rocket.module.isLoaded(name)) {
                     callback();
                  }
                  /*
                  If the module has not yet been loaded, do the neccessary checks and
                  resolve all the dependecies.
                  */
                  else {
                     let thisModule = Rocket.module.get(name);
                     let dependencies = (Rocket.module.isArray(thisModule.requires) && thisModule.requires.length > 0) ? thisModule.requires : false;
                     // Catch
                     if (!thisModule.loaded) {
                        thisModule.loaded = true;
                        // Check dependency
                        if (!dependencies) {
                           loadModuleFiles(name, thisModule, function () {
                              listModules.splice(listModules.indexOf(name), 1);
                              callback();
                           });
                        }
                        else {
                           loadModules(dependencies, function () {
                              loadModuleFiles(name, thisModule, function () {
                                 listModules.splice(listModules.indexOf(name), 1);
                                 callback();
                              });
                           });
                        }
                     }
                  }
               }
            }
         }
         // Execute
         /*
         Begin the module loading and resolve the top level requires as you
         would all other dependency level requires.
         */
         loadModules(listModules, function () {
            if (typeof callback === 'function') {
               if (listModules.length === 0) {
                  return callback(true);
               }
            }
         });
      }
   }

   export let newRequire = Require;
   export let load = loadFile;
}

// Bind to the Rocket object
Rocket.module = RockMod_Module;
Rocket.require = function () {
   return new RockMod_Require.newRequire;
}

// Load main file
RockMod_RequireLoadMain();
