/**
 * REIA - MIT license
 * https://github.com/cneuro/reia
 * client
 * @author Chris Nater
 * */

/// LOCALS ///

var formatter = function (dec) {
  return wNumb({
    'decimals': dec || 0,
    'thousand': ','
  });
};

/// CREATED ///

Template.metric.onCreated( function () {
  this.auto = new ReactiveVar(_.isUndefined(this.data.calculation) ? false : true);
});

/// RENDERED ///

Template.metricToggle.onRendered( function () {
  this.$('.metric-mode').bootstrapSwitch({
    'size': 'small',
    'labelText': 'Mode',
    'onText': 'Auto',
    'offText': 'Manual',
    'state': _.isUndefined(this.data.calculation) ? false : true,
    'disabled': _.isUndefined(this.data.calculation) ? true : false,
  });
});

Template.metricRadio.onRendered( function () {
  var $radios = this.$('.btn-group');

  __onTabVisible(this, function () {
    $radios.each( function (i, el) {
      var $el = $(el);
      $el.parents('.metric-radio').find('span').css('line-height', $el.height() + 'px');
    });
  });
});

Template.metricSlider.onRendered( function () {
  var $slider = this.$('.metric-slider'),
      $inputs = this.$('.metric-display-value'),
      $value = this.$('.metric-display-value-raw'),
      $display = this.$('.metric-display-value-formatted'),
      $bounds = this.$('.metric-display-bounds'),

      vals = this.data.values,
      opt = this.data.selector,
      boundsLabel = this.data.bounds || ['(or less)', '(or more)'],
      dec = opt.decimals,
      minMax = [vals[0], _.last(vals)],
      t = this;

  $slider.noUiSlider({
    'start': __arrayMid(vals).value,
    'connect': 'lower',
    'step': opt.step,
    'range': {
      'min': minMax[0],
      'max': minMax[1]
    }
  });
  $slider.noUiSlider_pips({
    'mode': 'count',
    'values': 3,
    'density': 10,
    'stepped': true,
    'format': formatter(dec)
  });

  var maxValLength = 0;
  for (var i = 0; i < vals.length; i++) {
    var charCount = vals[i].toString().length;
    if (charCount > maxValLength) {
      maxValLength = charCount;
    }
  }

  $value.attr({
    'step': opt.step,
    'min': minMax[0],
    'max': minMax[1]
  });
  $inputs.attr('size', maxValLength + 1);

  $slider.Link('lower').to($display, null, formatter(dec));
  $slider.Link('lower').to($value, null, wNumb({
    'decimals': opt.decimals || 0
  }));

  // easier to have here than mapped as a Meteor event
  $slider.on('slide set', function () {
    var val = $(this).val(),
        bounds = (function (val, bounds, boundsLabel) {
          if (val <= bounds[0]) {
            return ' ' + boundsLabel[0];
          }
          else if (val >= _.last(bounds)) {
            return ' ' + boundsLabel[1];
          }
          return '';
        })(val, minMax, boundsLabel);

    $bounds.text(bounds);
  });
});

Template.metricDropdown.onRendered( function () {
  var $select = this.$('select'),
      $desc = this.$('.metric-display-description'),
      i = __arrayMid(this.data.values).index,
      descs = this.data.descriptions;

  $select.select2({
    'minimumResultsForSearch': Infinity
  });

  if (descs) {
    $select.change( function () {
      $desc.text(descs[parseInt($(this).val(), 10)]);
    });
  }
  $select.val(i);
});

/// CONVENIENCE METHODS ///

var errorView = {},
    __error = function (id, args) {
      if (args) {
        errorView[id] = Blaze.renderWithData(
          Template.tabPaneNotification,
          args,
          $('.tab-pane.active .notification-container').get(0)
        );
      }
      else {
        if (!_.isUndefined(errorView[id])) {
          Blaze.remove(errorView[id]);
        }
      }
    },
    __requestCatScore = function (cat) {
      Meteor.call('getCategoryScore', cat, function (error, result) {
        if (error) {
          __error(error.title, {
            'header': 'Internal error: ' + error.title,
            'message': error.message,
            'type': 'danger'
          });
        }
        Results.update(cat, cat, result);
      });
    },
    __requestMetricScore = function (id, cat, val) {
      Meteor.call('getMetricScore', id, val, function (error, result) {
        if (error) {
          __error(error.title, {
            'header': 'Internal error: ' + error.title,
            'message': error.message,
            'type': 'danger'
          });
        }
        if (_.isNaN(result.points) && _.isNull(val)) {
          var title = $('.metric[data-metric-id="' + id + '"] .metric-title-display').text();
          __error(id, {
            'message': 'Setting metrics in other categories is required to automate ' + title + '.',
            'type': 'danger'
          });
        }
        else {
          __error(id);
          Results.update(id, cat, result);
          __throttle(cat, _.partial(__requestCatScore, cat));
        }
      });
    };

/// EVENTS ///

Template.metric.events({
  'switchChange.bootstrapSwitch .metric-mode': function (evt, t, state) {
    t.$('.metric-content').toggle(200, function () {
      t.auto.set(state);
      t.$('.metric-input').change();
    });
  },
  'mouseenter .metric': function (evt, t) {
    var mIndex = $(evt.currentTarget).index(),
        chartIDs = Results.chartMap[this._id];

    // category radar charts' metrics are sequential inputs, then outputs, so add to the index when hovering over outputs
    mIndex += this.type === 'output' ? $('.tab-pane.active .metric-inputs .metric').length : 0;

    _.each(chartIDs, function (chartID) {
      var chart = Results.charts[chartID].chartjs,
          ds = chart.datasets[0],
          d = ds.bars || ds.points || ds.segments;

      chart.showTooltip([d[mIndex]]);
    });
  },
  'mouseleave .metric': function (evt, t) {
    var chartIDs = Results.chartMap[this._id];
    _.each(chartIDs, function (chartID) {
      Results.charts[chartID].chartjs.draw();
    });
  },
  'change .metric .metric-input': function (evt, t, internal) {
    var mid = this._id,
        cat = this.category;

    if (t.auto.get()) {
      __throttle('auto-' + mid, _.partial(__requestMetricScore, mid, cat, null));
    }
    else {
      var $input = $(evt.currentTarget),
          $metric = t.$('.metric'),
          val = $input.val();

      Results.value.set(mid, val);

      if ($input.is('input:radio')) {
        val = [];
        var type = 'radio';
        $metric.find('.metric-radio input:checked').each(function (i, el) {
          var radioVal = parseInt($(el).val(), 10);
          val.push(radioVal);
        });
      }
      // dismiss notice when user manually changes a metric
      if (!internal) {
        $('.tab-pane.active .alert').alert('close');
      }
      // because all radio values are gathered for every change, wait a bit to avoid quick-succession firing
      __throttle('change-' + mid, _.partial(__requestMetricScore, mid, cat, val));
    }
    // now collect all auto metrics and recalculate
    $('.tab-pane.active .metric.auto').not($metric).each( function () {
      var $m = $(this);
          mid = $m.data('metric-id');
          cat = $m.data('category');

      __throttle('auto-' + mid, _.partial(__requestMetricScore, mid, cat, null));
    });
  }
});

// Firefox bizarrely fires .blur() before .focus(), so raw value input can't otherwise ever be shown
var ffFocused = false;

Template.metricSlider.events({
  // manually triggered because the linked input field is hidden and thus cannot fire onChange
  'change .metric-slider': function (evt, t) {
    t.$('.metric-input').change();
  },
  'click .metric-display-value-formatted': function (evt, t) {
    $(evt.currentTarget).addClass('hidden');
    var $value = t.$('.metric-display-value-raw');
    $value.removeClass('hidden');
    $value.focus();
  },
  'focus .metric-display-value-raw': function (evt, t) {
    ffFocused = true;
  },
  'blur .metric-display-value-raw': function (evt, t) {
    if (ffFocused) {
      $(evt.currentTarget).addClass('hidden');
      t.$('.metric-display-value-formatted').removeClass('hidden');
      ffFocused = false;
    }
  }
});

/// HELPERS ///

Template.metric.helpers({
  'auto': function () {
    return Template.instance().get('auto').get();
  },
  'metricNameId': function () {
    return __metricNameId(this);
  }
});

Template.metricTitle.inheritsHelpersFrom('metric');
Template.metricDropdown.inheritsHelpersFrom('metric');
Template.metricSlider.inheritsHelpersFrom('metric');
Template.metricToggle.inheritsHelpersFrom('metric');

Template.metricTitle.helpers({
  'value': function () {
    var val = Results.value.get(this._id);
    return val ? formatter(this.selector.decimals).to(val) : '';
  }
});

Template.metricRadio.helpers({
  'radioSelect': function (type) {
    return this.index === 0 ? type : '';
  },
  'group': function () {
    return 'group-' + s.slugify(Template.parentData(2).title) + '-' + s.slugify(Template.parentData().label);
  }
});
