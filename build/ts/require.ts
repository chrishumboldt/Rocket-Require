/**
@author Chris Humboldt
**/

// Extend Rocket
Rocket.defaults.require = {
   errors: true,
   rootPath: './node_modules/'
};

// Load main file (if provided)
function RockMod_RequireLoadMain () {
   let loadMainScript = document.querySelector('script[data-main]');

   if (loadMainScript) {
      const mainFile = loadMainScript.getAttribute('data-main');

      if (Rocket.is.string(mainFile) && mainFile.length > 0) {
         let customPath = (mainFile.substring(0, 2) === '~/') ? Rocket.defaults.rootPath : './';
         RockMod_Require.load(mainFile, false, customPath);
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
      isLoading: (name: string) => {
         // Catch
         if (!Rocket.is.string(name)) { return false; }

         // Continue
         const thisModule = listModules[name];
         return (Rocket.is.object(thisModule)) ? thisModule.loading : false;
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
            paths[i] = paths[i].replace(/~\//g, Rocket.defaults.require.rootPath);
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
         if (!Rocket.exists(obj.css) && !Rocket.exists(obj.js) && !Rocket.exists(obj.requires)) {
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
   export let isLoading = moduleMethods.isLoading;
   export let dependencies = moduleMethods.dependencies;
   export let list = listModules;
   export let loaded = moduleMethods.listLoaded;
   export let remove = moduleMethods.remove;
}

// Rocket require
module RockMod_Require {
   const isFirefox  = navigator.userAgent.indexOf('Firefox') > -1;

   // Functions
   function loadFile(file, callback, customRootPath: any) {
      let theInclude: any;
      let type;
      let rootUrl = (Rocket.is.string(customRootPath)) ? customRootPath : '';
      let filePath = (Rocket.is.url(file)) ? file : rootUrl + file;
      const ext = Rocket.get.extension(file);

      // Create include element
      switch (ext) {
         case 'css':
            if (isFirefox) {
               /*
               Date: 18 July 2017
               Its a bit of a hack but an elegant one regardless. All CSS loads are hacks anyway ;)
               Author: stoyanstefanov
               Reference URL: http://www.phpied.com/when-is-a-stylesheet-really-loaded/
               */
               theInclude = document.createElement('style');
               theInclude.textContent = '@import "' + filePath + '"';

               let poll = setInterval(() => {
                  try {
                     theInclude.sheet.cssRules;
                     clearInterval(poll);
                     setTimeout(() => {
                        return callback(true);
                     });
                  } catch(ev) {}
               }, 10);

               onReady(() => {
                  Rocket.dom.head.appendChild(theInclude);
               });
            } else {
               theInclude = document.createElement('link');
               theInclude.rel = 'stylesheet';
               theInclude.href = filePath;

               // Functions
               function loadCallback() {
                  Rocket.event.remove(theInclude, 'load', loadCallback);

                  if (Rocket.is.function(callback)) {
                     setTimeout(() => {
                        return callback(true);
                     });
                  }
               }

               function loadError() {
                  theInclude.onerror = () => {
                     if (Rocket.is.function(callback)) { return callback(false); }
                  };
               }

               function loadIE() {
                  theInclude.onreadystatechange = function () {
                     if (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete') {
                        this.onreadystatechange = null;
                        if (Rocket.is.function(callback)) { return callback(true); }
                     }
                  };
               }

               // Execute
               Rocket.event.add(theInclude, 'load', loadCallback);
               loadIE();
               loadError();
               onReady(() => {
                  Rocket.dom.head.appendChild(theInclude);
               });
            }

            break;

         case 'js':
            theInclude = document.createElement('script');
            theInclude.setAttribute('async', true);
            theInclude.src = filePath;

            // Complete callback
            theInclude.onload = () => {
               if (Rocket.is.function(callback)) { return callback(true); }
            }

            theInclude.onreadystatechange = function () {
               if (!this.readyState || this.readyState === 'loaded' || this.readyState === 'complete') {
                  this.onreadystatechange = null;
                  if (Rocket.is.function(callback)) { return callback(false); }
               }
            };

            theInclude.onerror = () => {
               if (Rocket.is.function(callback)) { return callback(false); }
            };

            // Add the script
            Rocket.dom.head.appendChild(theInclude);
            break;
      }
   }

   function onReady(callback) {
      if (document.body) {
         return callback();
      }
      setTimeout(() => {
         onReady(callback);
      });
   }

   // Load module files
   function loadModuleFiles(thisModule, callback) {
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
         return callback();
      }

      // Continue
      for (let file of files) {
         loadFile(file, function (resp) {
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
   class Require {
      modules: string[];

      constructor () {
         this.modules = [];
      }

      // Functions
      public add(name: string) {
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
      public load(callback: any) {
         // Variables
         const self = this;

         // Functions
         function loadExecute() {
            loadModules(self.modules, () => {
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
            } else {
               let thisModule = Rocket.module.get(name);

               /*
               Here we find that the module is already loaded or loading.
               Return the callback and move on as needed.
               */
               if (thisModule.loaded || thisModule.loading) {
                  if (thisModule.loaded) {
                     return callback();
                  } else {
                     // Poll the variable once loaded
                     let modIntervalCheck = setInterval(() => {
                        if (thisModule.loaded) {
                           clearInterval(modIntervalCheck);
                           return callback();
                        }
                     }, 10);
                  }
               }
               /*
               If the module has not yet been loaded, do the neccessary checks and
               resolve all the dependecies.
               */
               else {
                  let dependencies = (Rocket.is.array(thisModule.requires) && thisModule.requires.length > 0) ? thisModule.requires : false;

                  // Change state to loading
                  thisModule.loading = true;

                  // Check dependency
                  if (!dependencies) {
                     return loadModuleFiles(thisModule, callback);
                  } else {
                     loadModules(dependencies, () => {
                        return loadModuleFiles(thisModule, callback);
                     });
                  }
               }
            }
         }

         function loadModules(modules: string[], callback: any) {
            let count = modules.length;

            for (let thisModule of modules) {
               loadModule(thisModule, () => {
                  count--;
                  if (count === 0) {
                     setTimeout(() => {
                        return callback();
                     }, 10);
                  }
               });
            }
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
