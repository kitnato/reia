/**
 * REIA - MIT license
 * https://github.com/cneuro/reia
 * client
 * @author Chris Nater
 * */

 /// RENDERED ///

 Template.tabs.onRendered( function () {
   this.$('#nav-categories a:first').tab('show');
 });

/// HELPERS ///

Template.tabs.helpers({
  'tabBadge': function () {
    return Template.parentData().type + 'TabBadge';
  },
  'tabContent': function () {
    return Template.parentData().type + 'TabContent';
  }
});
