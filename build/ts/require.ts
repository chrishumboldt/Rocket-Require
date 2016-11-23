/**
 * File: build/ts/require.ts
 * Type: Typescript file
 * Author: Chris Humboldt
**/

'user strict';

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

// Rocket module
module RockMod_Module {
   // Variables
   let listModules:any = {};
   let listLoaded:string[] = [];

   // Functions
   /*
   All module related functions go here.
   */
   let moduleMethods = {
      add: function (obj:module) {
         // Catch
         if (!validate.module(obj)) {
            return false;
         }
         // Continue
         listModules[obj.name] = {
            loaded: false
         };
         if (typeof obj.css === 'string' || isArrayCheck(obj.css)) {
            listModules[obj.name].css = obj.css;
         }
         if (typeof obj.js === 'string' || isArrayCheck(obj.js)) {
            listModules[obj.name].js = obj.js;
         }
         if (isArray(obj.requires)) {
            listModules[obj.name].requires = obj.requires;
         }
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
         if (this.exists(name)) {
            return listModules[name];
         }
      },
      isLoaded: function (name:string) {
         // Catch
         if (typeof name !== 'string') {
            return false;
         }
         // Continue
         return (listLoaded.indexOf(name) < 0) ? false : true;
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
         };

         // Execute
         checkModule(name);
         return dependencies;
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
      module: function (obj:module) {
         let hasCSS = false;
         let hasJS = false;
         let hasRequires = false;
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
   export let loaded = listLoaded;
   export let remove = moduleMethods.remove;
}

// Rocket module
module RockMod_Require {
   // Variables
   var modules:string[] = [];

   // Load file
   function loadFile (file, callback) {
      let theInclude:any;
      let type;

      // Create include element
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
   };

   // Load module
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
               if (response) {
                  Rocket.module.loaded.push(name);
               }
               modules.splice(modules.indexOf(name), 1);
               return callback(true);
            }
         });
      }
   };

   // Initialiser
   function initialise (names:string[], callback:any) {
      // Catch
      if (!Rocket.module.isArray(names)) {
         return false;
      }
      // Continue
      function loadModules (names:string[], callback:any) {
         for (let name of names) {
            if (!Rocket.module.isLoaded(name) && Rocket.module.exists(name)) {
               let thisModule = Rocket.module.get(name);
               let dependencies = (Rocket.module.isArray(thisModule.requires) && thisModule.requires.length > 0) ? thisModule.requires : false;
               // Catch
               if (!thisModule.loaded) {
                  thisModule.loaded = true;
                  // Check dependency
                  if (!dependencies) {
                     loadModuleFiles(name, thisModule, function () {
                        callback();
                     });
                  }
                  else {
                     loadModules(dependencies, function () {
                        loadModuleFiles(name, thisModule, function () {
                           callback();
                        });
                     });
                  }
               }
            }
         }
      };
      function setModulesList () {
         /*
         Create a modules array. Then as you include the files we can pop and check
         once all modules are loaded and execute the callback;
         */
         for (let name of names) {
            modules = modules.concat(Rocket.module.dependencies(name));
         }
         modules = modules.filter(function (value, index, self) {
            return self.indexOf(value) === index;
         });
      }

      // Execute
      setModulesList();
      loadModules(names, function () {
         if (modules.length === 0) {
            return callback(true);
         }
      });


      /*
      var loadCount = 0;

      // Get the correct count
      for (let name of names) {
         if (!Rocket.module.isLoaded(name) && Rocket.module.exists(name) && !Rocket.module.isLooped(name)) {
            loadCount++;
         }
      }

      // Loop through modules
      for (let name of names) {
         if (!Rocket.module.isLoaded(name) && Rocket.module.exists(name) && !Rocket.module.isLooped(name)) {
            let thisModule = Rocket.module.get(name);
            let dependencies = (Rocket.module.isArray(thisModule.requires) && thisModule.requires.length > 0) ? thisModule.requires : false;
            // Check dependency
            if (!dependencies) {
               loadModule(thisModule, function () {
                  loadCount--;
                  if (loadCount === 0) {
                     callback();
                  }
               });
            }
            else {
               initialise(dependencies, function () {
                  loadModule(thisModule, function () {
                     loadCount--;
                     if (loadCount === 0) {
                        callback();
                     }
                  });
               });
            }
         }
      }
      */
   }

   // Exports
   export let init = initialise;
}

// Bind to the Rocket object
Rocket.module = RockMod_Module;
Rocket.require = RockMod_Require.init;
