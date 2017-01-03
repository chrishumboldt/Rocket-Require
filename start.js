Rocket.module.add({
   angular: {
      js: 'https://ajax.googleapis.com/ajax/libs/angularjs/1.5.6/angular.min.js'
   },
   button: {
      js: 'rocket-button/js/button.min.js',
      css: 'rocket-button/css/button.min.css'
   },
   inject: {
      requires: ['button', 'mustache'],
      js: 'rocket-inject/js/inject-lean.min.js'
   },
   mustache: {
      js: 'mustache/mustache.min.js'
   },
   propel: {
      css: 'rocket-propel/css/propel.min.css'
   },
   jquery: {
      js: 'https://code.jquery.com/jquery-3.1.1.js'
   }
});

// Require

var require = Rocket.require();
require.add('inject');
// require.add('propel');

require.load(function () {
   // console.log(Rocket.inject);
   // Rocket.inject.component({
   //    name: 'Tester',
   //    html: '<p>This is a test.</p>'
   // });
   // console.log(Rocket.inject.list);
});
