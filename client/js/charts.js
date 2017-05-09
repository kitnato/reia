/**
 * REIA - MIT license
 * https://github.com/cneuro/reia
 * client
 * @author Chris Nater
 * */

var allMetrics = function (t) {
  return $(t.firstNode).parents('.tab-pane').find('.metric-input');
};

var deployChart = function (t, inputMap) {
  var type = t.data.type,
      $chart = t.$('.chart'),
      chartID = $chart.data('chart-id'),
      ctx = $chart.get(0).getContext('2d'),
      typeCam = s.camelize(s.capitalize(type)),
      chart = new Chart(ctx)[typeCam](t.data.contents, ChartOptions[type]);

  $chart.attr('width', t.data.dim.width);
  $chart.attr('height', t.data.dim.height);

  $chart.fadeTo(100, 1);
  $chart.siblings('.loading').remove();

  if (Results.charts[chartID]) {
    delete Results.charts[chartID];
  }
  Results.charts[chartID] = {
    'chartjs': chart,
    'inputMap': inputMap
  };
  if (t.data.legend) {
    t.$('.chart-legend')
      .html(chart.generateLegend())
      .data('chart-id', chartID);
    t.$('.chart-legend').data('chart-id');
  }
  // initialise the metric scores for all rendered metrics
  allMetrics(t).trigger('change', true);
};

Template.chart.onRendered( function () {
  var t = this;

  // if it's an HTML widget, no ChartJS setup needed
  if (t.data.type === 'widget') {
    return false;
  }

  var cat = t.data.category,
      chartID = t.$('.chart').data('chart-id'),
      inputMap = {},
      categories = __getCategories('metric'),
      // dataIndex determines whether dataset labels or data category labels are used to index the value if there are no id labels (PolarArea or Pie), generate them through segment data in 'contents'
      sets = t.data.contents[t.data.dataIndex] || t.data.contents;

  // a summary chart
  if (cat === 'summary') {
    _.each(categories, function (category, i) {
      if (_.isUndefined(Results.chartMap[category])) {
        Results.chartMap[category] = [];
      }
      Results.chartMap[category].push(chartID);
    });

    _.each(sets, function (set, i) {
      var label,
          dsI = 0,  // pie and polar-area segments and labels only have 1 "dataset"
          valI = i;
      // generate inputMap from dataset labels of a chart
      if (_.isObject(set)) {
        label = set.label.toLowerCase();
        // if labels are to be generated from the dataset labels and the chart isn't Pie or Polar
        if (['bar', 'line', 'radar'].indexOf(t.data.type) !== -1) {
          dsI = i;
          valI = t.data.valueIndex;
        }
      }
      // or a list of String labels
      else if (_.isString(set)) {
        label = set.toLowerCase();
      }
      inputMap[label] = {
        'datasetIndex': dsI,
        'valueIndex': valI
      };
    });
    deployChart(t, inputMap);
  }
  // main radar chart per category
  else if (_.contains(categories, cat)) {
    __onTabVisible(t, function () {
      t.$('.chart').trigger('setup-metrics-radar');
    });
  }
  else {
    // predetermined stock chart
    __onTabVisible(t, function () {
      deployChart(t, inputMap);
    });
  }
});

/// EVENTS ///

var highlight = function (evtType, d) {
  if (evtType === 'mouseenter') {
    d.save();
    d.fillColor = d.highlightFill || d.highlightColor;
  }
  else {
    d.restore();
  }
};

Template.chart.events({
  'mousemove .chart-metrics': function (evt, t) {
    var data = this,
        cid = $(evt.currentTarget).data('chart-id'),
        points = Results.charts[cid].chartjs.getPointsAtEvent(evt);

    $('.metric').removeClass('highlight');
    _.each(points, function (point) {
      $('.metric[data-metric-id="' + data.metricID[s.slugify(point.label)] + '"]').addClass('highlight');
    });
  },
  'mouseleave .chart-metrics': function (evt, t) {
    $('.metric').removeClass('highlight');
  },
  'setup-metrics-radar .chart': function (evt, t) {
    var inputMap = {},
        chartID = t.data._id,
        metricIDs = [];

    // @TODO different for Polar & Pie charts
    t.data.contents.datasets[0].data = [];
    t.data.contents.labels = [];
    t.data.metricID = {};

    allMetrics(t).each( function (i, el) {
      metricIDs.push($(el).parents('.metric').data('metric-id'));
    });

    var q = {
          'collection': 'metrics',
          'criteria': {
            '_id': {
              '$in': metricIDs
            }
          }
        },
        metrics = __dbQuery(q);

    metrics.forEach( function (metric, i) {
      var mid = metric._id,
          slug = metric.shorthand || metric.title;

      inputMap[mid] = {
        'datasetIndex': 0,
        'valueIndex': i
      };
      if (_.isUndefined(Results.chartMap[mid])) {
        Results.chartMap[mid] = [];
      }
      if (!_.contains(Results.chartMap[mid], chartID)) {
        Results.chartMap[mid].push(chartID);
      }
      t.data.metricID[s.slugify(slug)] = mid;
      t.data.contents.labels[i] = slug;
      t.data.contents.datasets[0].data[i] = 0;
    });

    if (metrics.count() > 0) {
      deployChart(t, inputMap);
    }
  }
});

Template.chartLegend.events({
  // highlight datasets from legend elements
  'mouseenter .legend li, mouseleave .legend li': function (evt, t) {
    var index = $(evt.currentTarget).index();
    var chart = Results.charts[this._id].chartjs;
    var data = chart.datasets ?
      chart.datasets[index].points || chart.datasets[index].bars :
      chart.segments[index];

    // bars & point
    if (_.isArray(data)) {
      _.each(data, function (d, i) {
        highlight(evt.type, d);
      });
      chart.draw();
    }
    // pie & polar-area
    else {
      highlight(evt.type, data);
      chart.showTooltip([data]);
    }
  },
  'mouseleave .legend li': function (evt, t) {
    Results.charts[this._id].chartjs.draw();
  }
});

/// HELPERS ///

Template.chartsPane.helpers({
  'charts': function () {
    var pd = Template.parentData() || {},
        q = {
        'collection': 'charts',
          'criteria': {
            'category': pd.category || this.category
          }
        };
    return __dbQuery(q);
  },
  'fullWidth': function () {
    if (this.dim && this.dim.fullWidth) {
      return '';
    }
    return 'col-md-6';
  },
  'coveragePercent': function (cat) {
    var category = cat === 'summary'? {} : cat,
        active = __getMetrics(category, null, {
          'active': {
            '$ne': false
          }
        }).count(),
        all = __getMetrics(category, null, {}).count();

    return Math.round((active / all) * 100);
  }
});
