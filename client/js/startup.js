/**
 * REIA - MIT license
 * https://github.com/cneuro/reia
 * client
 * @author Chris Nater
 * */

Meteor.startup(function () {
  Session.set('currentProject', {
    '_id': 'new'
  });
});
