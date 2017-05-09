/**
 * REIA - MIT license
 * https://github.com/cneuro/reia
 * server
 * @author Chris Nater
 * */

var __metricNameIdVars = (function () {
      var metrics = __dbQuery({'collection': 'metrics'}),
          nameIds = '';
      metrics.forEach( function (metric) {
        // @TODO only valid for numeric metrics
        nameIds += 'var ' + __metricNameId(metric, true) + ' = 0;';
      });
      return nameIds;
    })(),

  __updateVar = function (defId) {
    eval(defId + '=' + Scores.nameIndex[defId].val);
  },

  __getMetricScore = {
    'slider': function (metric, val) {
      if (_.isNaN(val)) {
        // missing variables in calculation
        return null;
      }
      val = parseFloat(val, 10);
      var pts = metric.points,
          vals = metric.values,
          // is this the exact value?
          index = _.indexOf(vals, val, true);

      if (index === -1) {
        // get the closest upper index
        index = _.sortedIndex(vals, val);
        // value is smaller or equal to lowest
        if (index === 0) {
          return pts[0];
        }
        // value is larger than the highest
        if (index === pts.length) {
          return _.last(pts);
        }
        // if the value falls somewhere in the middle (most common case)
        if (index > 0) {
          var diffV = vals[index] - vals[index - 1],
              diffP = pts[index] - pts[index - 1],  // normally 1
              steps = (val - vals[index - 1]) * (diffP / diffV);

          return pts[index - 1] + steps;
        }
      }
      else {
        // lucky!
        return pts[index];
      }
    },
    'dropdown': function (metric, val) {
      var pt = metric.points[parseInt(val, 10)];
      return pt;
    },
    'radio': function (metric, vals) {
      var aggr = 0;
      // summing points from the radio indices
      _.each(vals, function (val, i) {
        val = parseInt(val, 10);
        aggr += metric.radios[i].points[val];
      });
      var ptIndex = metric.results.values.indexOf(aggr);
      return metric.results.points[ptIndex];
    }
  },

  __calculateMetrics = function (project) {
    project.basic.projectType = (function () {
      var nc = project.technical.inputNameplateCapacity;
      if (nc <= 5) {
        return 'Community (1-5MW)';
      }
      if (nc > 6 && nc <= 20) {
        return 'Commercial (6-20MW)';
      }
      if (nc > 20) {
        return 'Utility 21-500MW';
      }
    })();
    return project;
  };

// initialise local variables based on metric names for calculation automation
eval(__metricNameIdVars);

/// METEOR METHODS ///

Meteor.methods({
  'getMetricScore': function (id, val) {
    check(id, String);
    check(val, Match.OneOf(String, [Number], null));

    var metric = DB.metrics.findOne(id);

    if (metric) {
      var defId = __metricNameId(metric, true);

      if (_.isNull(val)) {
        val = eval(metric.calculation.equation);
      }
      var points = (_.isUndefined(val) || _.isNaN(val) || !_.isFinite(val)) ? NaN : __getMetricScore[metric.selector.type](metric, val);

      Scores[id] = points;
      Scores.nameIndex[defId] = {
        'id': id,
        'val': val,
        'points': points
      };
      __updateVar(defId);
      return Scores.nameIndex[defId];
    }
    throw new Meteor.Error(404, 'No such metric.');
  },
  'getCategoryScore': function (cat) {
    check(cat, String);

    var metrics = __getMetrics(cat, null, {
          'active': {
            '$ne': false
          }
        }),
        n = metrics.count();

    var sum = 0,
        error = false;

    metrics.forEach( function (metric, i) {
      var result = Scores[metric._id];

      if (_.isUndefined(result)) {
        error = true;
      }
      else {
        sum += result;
      }
    });
    if (error) {
      return 0;
    }
    return {
      'points': sum / n
    };
  }
});
