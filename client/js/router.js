/**
 * REIA - MIT license
 * https://github.com/cneuro/reia
 * client
 * @author Chris Nater
 * */

 FlowRouter.notFound = {
   'action': function() {
     FlowRouter.go('project');
   }
 };

FlowRouter.route('/project', {
  'action': function () {
    BlazeLayout.render('layout', {'yield': 'project'});
  },
  'name': 'project'
});

FlowRouter.route('/configuration', {
  'action': function () {
    BlazeLayout.render('layout', {'yield': 'configuration'});
  },
  'name': 'configuration'
});
