Rocket.module.add({
   name: 'angular',
   js: 'angular/angular.min.js'
});
Rocket.module.add({
   name: 'button',
   js: 'rocket-button/js/button.min.js',
   css: 'rocket-button/css/button.min.css'
});
Rocket.module.add({
   name: 'inject',
   requires: ['mustache'],
   js: 'rocket-inject/js/inject-lean.min.js'
});
Rocket.module.add({
   name: 'mustache',
   js: 'mustache/mustache.min.js'
});
Rocket.module.add({
   name: 'propel',
   css: 'rocket-propel/css/propel.min.css'
});

// Require
var require = Rocket.require();
require.add('inject');
require.add('propel');
require.load();
