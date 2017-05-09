/**
 * REIA - MIT license
 * https://github.com/cneuro/reia
 * client
 * @author Chris Nater
 * */

/// RENDERED ///

 Template.nav.onRendered( function () {
   this.$('[data-toggle="tooltip"]')
     .tooltip({
       // only show tooltip if it's not an open dropdown menu
       'title': function () {
         var $el = $(this);

         if ($el.hasClass('dropdown open')) {
           return '';
         }
         return $el.data('title');
       }
     });
 });

/// HELPERS ///

Template.nav.helpers({
  'active': function (route) {
    return __getCurrentPage() === route ? 'active' : '';
  }
});
