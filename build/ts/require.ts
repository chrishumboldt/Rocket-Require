/**
 * Author: Chris Humboldt
**/

// Extedn Rocket
Rocket.defaults.require = {
   errors: true,
   rootUrl: './node_modules/'
};

// Load main file (if provided)
function RockMod_RequireLoadMain () {
   let loadMainScript = document.querySelector('script[data-main]');

   if (loadMainScript) {
      const mainFile = loadMainScript.getAttribute('data-main');

      if (Rocket.is.string(mainFile) && mainFile.length > 0) {
         RockMod_Require.load(mainFile, false, './');
      }
   }
};

// Rocket module
module RockMod_Module {
   // Variables
   let listModules: any = {};

   // Functions
   /*
   All module related methods go here. Makes it easier to manage,
   especially within Typescript.
   */
   let moduleMethods = {
      add: (obj: module) => {
         // Catch
         if (!Rocket.is.object(obj)) { return false; }

         // Continue
         for (let key in obj) {
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
      dependencies: (name: string) => {
         // Catch
         if (!Rocket.is.string(name)) { return false; }

         // Continue
         var dependencies = [];

         // Functions
         function checkModule(name: string) {
            if (moduleMethods.exists(name)) {
               dependencies.push(name);
               let thisModule = listModules[name];

               if (Rocket.is.array(thisModule.requires)) {
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
      exists: (name: string) => {
         // Catch
         if (!Rocket.is.string(name)) { return false; }

         // Continue
         return Rocket.exists(listModules[name]);
      },
      get: (name: string) => {
         // Catch
         if (!Rocket.is.string(name)) { return false; }

         // Continue
         return listModules[name];
      },
      isLoaded: (name: string) => {
         // Catch
         if (!Rocket.is.string(name)) { return false; }

         // Continue
         const thisModule = listModules[name];
         return (Rocket.is.object(thisModule)) ? thisModule.loaded : false;
      },
      listLoaded: () => {
         let listLoaded: any = [];

         for (let key in listModules) {
            if (listModules.hasOwnProperty(key) && listModules[key].loaded) {
               listLoaded.push(key);
            }
         }

         return listLoaded;
      },
      remove: (name: string) => {
         // Catch
         if (!Rocket.is.string(name) || !Rocket.exists(listModules[name])) { return false; }

         // Continue
         delete listModules[name];
      },
      sanitisePaths: (paths: any) => {
         // Convert string to array
         if (Rocket.is.string(paths)) {
            paths = [paths];
         }

         // Set the root url if need be
         for (var len = paths.length, i = 0; i < len ; i++) {
            paths[i] = paths[i].replace(/~\//g, Rocket.defaults.require.rootUrl);
         }

         return paths;
      }
   };
   let validate = {
      module: (name: string, obj: module) => {
         let hasCSS = false;
         let hasJS = false;
         let hasRequires = false;

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
   export let add = moduleMethods.add;
   export let exists = moduleMethods.exists;
   export let get = moduleMethods.get;
   export let isLoaded = moduleMethods.isLoaded;
   export let dependencies = moduleMethods.dependencies;
   export let list = listModules;
   export let loaded = moduleMethods.listLoaded;
   export let remove = moduleMethods.remove;
}

// Rocket require
module RockMod_Require {
   // Functions
   function loadFile (file, thisCallback, customRootUrl: any) {
      let callback = (Rocket.is.function(thisCallback)) ? thisCallback : function () {};
      let theInclude: any;
      let type;
      let rootUrl = (Rocket.is.string(customRootUrl)) ? customRootUrl : Rocket.defaults.require.rootUrl;
      let filePath = (Rocket.is.url(file)) ? file : rootUrl + file;

      // Create include element
      if (/(.css)$/.test(file)) {
         type = 'css';
         theInclude = document.createElement('link');
         theInclude.rel = 'stylesheet';
         theInclude.href = filePath;
      } else if (/(.js)$/.test(file)) {
         type = 'js';
         theInclude = document.createElement('script');
         theInclude.setAttribute('async', true);
         theInclude.src = filePath;
      }

      // Listen for completion
      theInclude.onload = () => {
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
      theInclude.onerror = () => {
         return callback(false);
      };

      document.getElementsByTagName('head')[0].appendChild(theInclude);
   }
   // Load module files
   function loadModuleFiles (name, thisModule, callback) {
      let count = 0;
      let files = [];

      // CSS
      if (Rocket.is.string(thisModule.css)) {
         files.push(thisModule.css);
      } else if (Rocket.is.array(thisModule.css) && thisModule.css.length > 0) {
         files = files.concat(thisModule.css);
      }

      // JS
      if (Rocket.is.string(thisModule.js)) {
         files.push(thisModule.js);
      } else if (Rocket.is.array(thisModule.js) && thisModule.js.length > 0) {
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
      modules: string[];
      modulesCount: number;

      constructor () {
         this.modules = [];
      }

      // Functions
      public add (name:string) {
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
      }

      /*
      The load function will take the newly created require instance and execute
      the loading of each module in the various dependency stacks.
      */
      public load (callback: any) {
         // Variables
         let listModules = this.modules.reverse();
         let modulesCount = this.modulesCount;

         // Functions
         function loadExecute() {
            loadModules(listModules, () => {
               return callback();
            });
         }

         function loadModules(modules: string[], callback: any) {
            let count = modules.length;

            for (let thisModule of modules) {
               loadModule(thisModule, () => {
                  count--;
                  if (count === 0) {
                     return callback();
                  }
               });
            }
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
            } else {
               /*
               Here we find that the module is already loaded.
               Return the callback and move on.
               */
               if (Rocket.module.isLoaded(name)) {
                  return callback();
               }
               /*
               If the module has not yet been loaded, do the neccessary checks and
               resolve all the dependecies.
               */
               else {
                  let thisModule = Rocket.module.get(name);
                  let dependencies = (Rocket.is.array(thisModule.requires) && thisModule.requires.length > 0) ? thisModule.requires : false;

                  // Change state to loaded
                  // removeModule(name);
                  thisModule.loaded = true;

                  // Check dependency
                  if (!dependencies) {
                     loadModuleFiles(name, thisModule, () => {
                        return callback();
                     });
                  } else {
                     loadModules(dependencies, () => {
                        loadModuleFiles(name, thisModule, () => {
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

         // Execute
         loadExecute();
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
