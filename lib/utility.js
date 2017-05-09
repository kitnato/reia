/**
 * REIA - MIT license
 * https://github.com/cneuro/reia
 * lib
 * @author Chris Nater
 * */

__metricNameId = function (metric, full) {
  return s.camelize(((full ? metric.category + '_' : '' ) + metric.type + '_' + (metric.shorthand || metric.title)).replace(/\W+/g, ''));
};

__onTabVisible = function (template, callback) {
  var $tabPane = $(template.firstNode).parents('.tab-pane'),
      tabCat = $tabPane.data('category'),
      $tab = $('#nav-categories a[data-category="' + tabCat + '"]');

  $tab.one('shown.bs.tab', function () {
    callback();
  });
};

__resizeCharts = function () {
  $('.tab-pane.active .chart').each( function () {
    Results.charts[$(this).attr('id')].chartjs.resize();
  });
};

__getCurrentPage = function () {
  return FlowRouter.getRouteName();
};

__getMetrics = function (category, type, criteria) {
  var q = {
    'collection': 'metrics',
    'criteria': {},
    'projection': {
      'sort': {
        'active': 1,
        'title': 1
      }
    }
  };

  if (category) {
    q.criteria.category = category;
  }
  if (type) {
    q.criteria.type = type;
  }
  _.extend(q.criteria, criteria || {});
  return __dbQuery(q);
};

__getCategories = function (type) {
  switch (type) {
    case 'metric':
      return ['technical', 'financial', 'environmental', 'socioeconomic'];
      break;
    case 'input':
      return ['basic', 'technical', 'financial', 'environmental', 'socioeconomic'];
      break;
    case 'output':
      return ['basic', 'technical', 'financial', 'environmental', 'socioeconomic'];
      break;
    default:
      return ['basic', 'technical', 'financial', 'environmental', 'socioeconomic', 'summary'];
      break;
  }
};

__arrayMid = function (values) {
  var middle = Math.floor(values.length / 2);
  return {
    'index': middle,
    'value': values[middle]
  };
};

// Thanks Jérémie Astori; http://stackoverflow.com/questions/1726630/javascript-formatting-number-with-exactly-two-decimals
__roundFixed = function (value, dec) {
  if (dec === 0) {
    return Math.round(value);
  }

  value = +value;
  dec = dec || 2;

  if (isNaN(value) || !(_.isNumber(dec) && dec % 1 === 0))
    return NaN;

  // Shift
  value = value.toString().split('e');
  value = Math.round(+(value[0] + 'e' + (value[1] ? (+value[1] + dec) : dec)));

  // Shift back
  value = value.toString().split('e');
  return +(value[0] + 'e' + (value[1] ? (+value[1] - dec) : -dec));
};

// custom throttle function to take into account Meteor synchronization
var throttler = {};
__throttle = function (id, callback, delay) {
  if (throttler[id]) {
    Meteor.clearTimeout(throttler[id]);
  }
  throttler[id] = Meteor.setTimeout(callback, delay || 100);
};
