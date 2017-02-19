/**
 * Author: Chris Humboldt
**/

// Decalre the module
Rocket.module.add({
   jquery: {
      js: 'https://code.jquery.com/jquery-3.1.1.js'
   }
});

// Require
var require = Rocket.require();
require.add('jquery');

require.load(function () {
   $('#success-text').text('jQuery has just been loaded with Rocket Require! Check the Document HEAD tag to see the script.');
});
