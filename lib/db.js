/**
 * REIA - MIT license
 * https://github.com/cneuro/reia
 * lib
 * @author Chris Nater
 * */

__dbSetup = function () {
  return {
    'metrics': {
      'criteria': {
        'deleted': {
          '$ne': true
        }
      },
      'projection': {
        'sort': {
          'order': 1,
          'type': 1
        }
      }
    },
    'charts': {
      'criteria': {
        'deleted': {
          '$ne': false
        }
      },
      'projection': {
        'sort': {
          'order': 1
        }
      }
    }
  };
};

__dbQuery = function (args) {
  var setup = __dbSetup()[args.collection];

  if (args.criteria) {
    _.extend(setup.criteria, args.criteria);
  }
  if (args.projection) {
    _.extend(setup.projection, args.projection);
  }
  // DB is defined server-side
  return DB[args.collection].find(setup.criteria, setup.projection);
};
