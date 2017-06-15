# Rocket Require
A script and stylesheet loading module.

* [Getting Started](#getting-started)
* [Full Example](#full-example)
* [Modules](#modules)
   * [Dependencies](#dependencies)
   * [Remove](#remove)
   * [List](#list)
* [Initialisation](#initialisation)
   * [Load](#load)
   * [Defaults](#defaults)

## Getting Started
Install via NPM.

```
npm install rocket-require
```

**NOTE** that this module has a dependency [Rocket Tools (21kb)](https://github.com/chrishumboldt/Rocket-Tools) which will automatically be installed as well.

Simply start by including the required Javascript file.

```html
<body>
   /* Your content goes here */
   <script src="node_modules/rocket-tools/js/tools.min.js"></script>
   <script src="node_modules/rocket-require/js/require.min.js"></script>
</body>
```

## Full Example
In the example below we are attempting to load a local Rocket Button module. We can see that there is a dependency on Rocket Tools, which has also been declared. As a result Rocket Tools will be loaded first.

Once all files are present on the DOM a function is called displaying a message.

```html
<script>
// Initilise a require instance
var require = Rocket.require();

// Declare the modules
Rocket.module.add({
   rocketButton: {
      requires: ['rocketTools'],
      css: ['~/rocket-button/css/button.min.css']
      js: ['~/rocket-button/js/button.min.js']
   },
   rocketTools: {
      js: ['~/rocket-tools/js/tools.min.js']
   }
});

// Require
require.add('rocketButton');

require.load(function () {
   console.log('Rocket Buttons and Rocket Tools have just been loaded with Rocket Require!');
});
</script>
```

You will notice the **~/** before all the paths. This inserts the defaults root path to all module files which by default is set to **./node_modules/**. Thus the resulting path for all files becomes:

```javascript
rocketButton: {
   requires: ['rocketTools'],
   css: ['./node_modules/rocket-button/css/button.min.css']
   js: ['./node_modules/rocket-button/js/button.min.js']
},
rocketTools: {
   js: ['./node_modules/rocket-tools/js/tools.min.js']
}
```

This is just a useful shorthand feature.

## Modules
All require modules are manage globally. To add define the different modules names and the accompanying files.

```javascript
Rocket.module.add({
   testModule: {
      css: '~/test/css/file.min.css',
      js: '~/test/js/file.min.js'
   }
});
```

As you can see a simple string is used for the file paths. You can however use an array of strings should there be more then one file of any type. For example.

```javascript
Rocket.module.add({
   testModule: {
      css: [
         '~/test/css/file-one.min.css',
         '~/test/css/file-two.min.css'
      ]
   }
});
```

You can declare multiple modules at a time by adding more properties to the add method. For example:

```javascript
Rocket.module.add({
   testModule: {
      css: [
         '~/test/css/file.min.css'
      ]
   },
   anotherModule: {
      css: [
         '~/another/css/file.min.css'
      ]
   }
});
```

While you do not have to declare all modules at the same time, it is recommended to keep it all in once place for easier management. You can however add more modules at anytime within the lifecycle of the app.

You will notice the **~/** at the beginning of the file paths. This is explained further up in the [Full Example](#full-example) section and is managed via the **rootPath** property in the [Defaults](#defaults).

Should you not use this character, paths will then become relative.

#### Dependencies
Most times modules have dependencies on other modules. To assign a dependency simply add a `requires` property to the module being declared. **Note** that the requires property is an array. For example:

```javascript
Rocket.module.add({
   testModule: {
      requires: ['jQuery'],
      css: '~/test/css/file.min.css'
   }
});
```

If the module you are referencing does not exist or has not been declared then it will simply be passed over and ignored.

#### Remove
If for whatever reason you decide you want to remove a module do so using the remove method.

```javascript
Rocket.module.remove('testModule');
```

#### List
You are also able to see a list of all modules by referencing the list object. For example:

```javascript
console.log(Rocket.module.list);
```

## Initialisation
To start initialise a require instance.

```javascript
var require = Rocket.require();
```

#### Load
Once initialised, you can begin to load modules and the files as needed. To do so you first need to tell Rocket Require what modules you are looking to add to the page. For example:

```javascript
require.add('testModule');
require.add('anotherModule');
```

Once done execute the load method to add the files to your page. This method also has a callback function that allows you to execute code once the loading is complete. For example:

```javascript
require.load(function () {
   console.log('The files have loaded.');
});
```

Rocket require will manage all the dependencies and the loading there off for you, making sure that everything is in order. Should you have any errors or dependency loops, you will see an error message in the console.

#### Defaults
You can also overwrite the properties globally by altering the Rocket defaults. To do so reference the defaults object property, for example:

```javascript
// This will hide all errors
Rocket.defaults.require.errors = false;

// This is the default root path for all modules.
// By default it is set to './node_modules/'.
Rocket.defaults.require.rootPath = './my-modules/';
```

## Author
Created and maintained by Chris Humboldt<br>
Website: <a href="http://chrishumboldt.com/">chrishumboldt.com</a><br>
Twitter: <a href="https://twitter.com/chrishumboldt">twitter.com/chrishumboldt</a><br>
GitHub <a href="https://github.com/chrishumboldt">github.com/chrishumboldt</a><br>

## Copyright and License
Copyright 2017 Rocket Project

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
