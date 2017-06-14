# Rocket Require
A script and stylesheet loading module.

* [Getting Started](#getting-started)
* [Full Example](#full-example)
* [Initialisation](#initialisation)
   * [Options](#options)
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
In the example below we are attempting to load a local Rocket Button module. We can see that is a dependency on Rocket Tools, which has also been declared. As a result Rocket Tools will be loaded first.

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

## Initialisation
Before you can use the require module you first need to initialise an instance. You will then be able to manage your requirements as needed.

```javascript
var require = Rocket.require();
```
