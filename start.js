Rocket.module.add({
  angular: {
    js: 'angular/angular.min.js'
  },
  button: {
    js: 'rocket-button/js/button.min.js',
    css: 'rocket-button/css/button.min.css'
  },
  inject: {
    requires: ['mustache'],
    js: 'rocket-inject/js/inject-lean.min.js'
  },
  mustache: {
    js: 'mustache/mustache.min.js'
  },
  propel: {
    css: 'rocket-propel/css/propel.min.css'
  },
  tester: {
    js: '../tester.js'
  }
});

// Require
var require = Rocket.require();
require.add('inject');
require.add('propel');

require.load(function () {
  Rocket.inject.component({
    name: 'Tester',
    html: '<p>This is a test.</p>'
  });
  console.log(Rocket.inject.list);
});
