/**
 * REIA - MIT license
 * https://github.com/cneuro/reia
 * server
 * @author Chris Nater
 * */

var SEED_DB = {
  'metrics': true,
  'charts': true
};

DB = {};
Scores = {
  'nameIndex': {}
};

var seedDB = function (name) {
  console.log('***SEEDING DB: ' + name + '***');
  var db = DB[name],
      assetsPath = 'assets/app/',
      insert = function (path) {
        var contents = fs.readdirSync(path);
        _.each(contents, function (p, i) {
          var sub = '/' + p;
          if (s.include(p, '.json')) {
            var jsonPath = (path + sub).replace(assetsPath, '');
            console.log('  > ' + jsonPath);
            var entries = JSON.parse(Assets.getText(jsonPath));
            _.each(entries, function (entry, i) {
              entry.order = entry.order || i;
              db.insert(entry);
            });
          }
          else {
            insert(path + sub);
          }
        });
      };

  db.remove({});
  insert(assetsPath + name);
};

_.each(__dbSetup(), function (setup, name) {
  DB[name] = new Mongo.Collection(name);

  Meteor.publish(name, function () {
    var q = _.extend(setup, {
      'collection': name
    });
    return __dbQuery(q);
  });
});

Meteor.startup(function () {
  _.each(SEED_DB, function (go, name) {
    if (go) {
      seedDB(name);
    }
  });
});
