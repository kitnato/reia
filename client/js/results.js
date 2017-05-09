/**
 * REIA - MIT license
 * https://github.com/cneuro/reia
 * client
 * @author Chris Nater
 * */

Results = {
  // keeps track of which category has been properly scored, as defined by getCategoryScore()
  // reactive, one-to-one mapping of category name to Boolean
  'ready': {
    'state': new ReactiveDict(),
    'reset': function () {
      _.each(__getCategories(), function (cat) {
        Results.ready.state.set(cat, false);
      });
    },
    'set': function (category, state) {
      Results.ready.state.set(category, state);
      Results.ready.state.set('summary',
        _.reduce(Results.ready.state.keys, function (memo, val, key) {
          return memo && (key === 'summary' ? true : JSON.parse(val));
        }, true)
      );
    }
  },
  // keeps track of category scores
  'score': {
    'state': new ReactiveDict(),
    'reset': function () {
      _.each(__getCategories('output'), function (cat) {
        Results.score.state.set(cat, null);
      });
    }
  },
  // keeps track of metric values
  'value': new ReactiveDict(),
  // keeps track of category ratings A-F
  'rating': {
    //       <=1: F
    //  >1 - <=3: E
    //  >3 - <=5: D
    //  >5 - <=7: C
    //  >7 - <=9: B
    // >9 - <=10: A
    'ranges': {
      'A': [8, 10],
      'B': [6, 8],
      'C': [4, 6],
      'D': [1.5, 4],
      'F': [0, 1.5]
    },
    'stateDisplay': new ReactiveDict(),
    'stateSortable': new ReactiveDict(),
    'set': function (category) {
      var RR = Results.rating,
          score = Results.score.state.get(category),
          rating = function (score) {
            var r = _.find(_.pairs(RR.ranges), function (range) {
              return (score > range[1][0] && score <= range[1][1]);
            });

            if (r[0] !== 'F') {
              var min = r[1][0],
                  max = r[1][1],
                  rDiff = (max - min) / 3,
                  slantSymbol = '',
                  slantLetter = 'B';

              if (score < min + rDiff) {
                slantSymbol = '-';
                slantLetter = 'C';
              }
              if (score > max - rDiff) {
                slantSymbol = '+';
                slantLetter = 'A';
              }
            }
            return {
              'display': r[0] + (slantSymbol || ''),
              'sortable': r[0] + (slantLetter || '')
            }
          };

      var r = rating(score);
      RR.stateDisplay.set(category, r.display);
      RR.stateSortable.set(category, r.sortable);
      // check if all categories are scored; if so, set overall summary score
      var allSet = true,
          sum = 0;

      _.each(__getCategories('metric'), function (cat) {
        var s = Results.score.state.get(cat);
        if (_.isNull(s)) {
          allSet = false;
        }
        sum += s;
      });

      if (allSet) {
        r = rating(sum / __getCategories('metric').length);
        RR.stateDisplay.set('summary', r.display);
        RR.stateSortable.set('summary', r.sortable);
      }
    },
    'reset': function () {
      _.each(__getCategories('output'), function (cat) {
        Results.rating.stateDisplay.set(cat, null);
        Results.rating.stateSortable.set(cat, null);
      });
    }
  },
  'chartMap': {
    // one-to-many mapping of metric ID or category name to corresponding Chart IDs
  },
  'charts': {
    // unique chart ID:
    //   'chartjs':  [Object] Chart.js chart
    //   'inputMap': [Array of Objects] Set defines the Chart's dataset and value index for every input
    //               datasetIndex: [Integer] (0 for non-summary charts)
    //               valueIndex: [Integer]
  },
  'update': function (id, category, result) {
    var charts = Results.chartMap[id];

    _.each(charts, function (cid) {
      var chart = Results.charts[cid],
          dsI = chart.inputMap[id].datasetIndex,
          valI = chart.inputMap[id].valueIndex,
          d = chart.chartjs.datasets ?
              chart.chartjs.datasets[dsI].points || chart.chartjs.datasets[dsI].bars :
              chart.chartjs.segments;

      d[valI].value = __roundFixed(result.points, 2);
      __throttle(cid, _.bind(chart.chartjs.update, chart.chartjs));
    });

    __throttle('update-' + id, function () {
      if (result.val) {
        Results.value.set(id, result.val);
      }
      if (_.isNaN(result.points)) {
        Results.ready.set(category, false);
      }
      else if (id === category) {
        Results.score.state.set(category, result.points);
        Results.rating.set(category);
        Results.ready.set(category, true);
      }
    });
  }
};
