/**
 * REIA - MIT license
 * https://github.com/cneuro/reia
 * client
 * @author Chris Nater
 * */

DB = {};

var DBNames = ['metrics', 'charts'];

_.each(DBNames, function (name) {
  Meteor.subscribe(name);
  DB[name] = new Mongo.Collection(name);
});
