/**
 * REIA - MIT license
 * https://github.com/cneuro/reia
 * client
 * @author Chris Nater
 * */

/// CREATED ///

Template.basicPane.onCreated( function () {
  this.setReady = function () {
    var rdy = true;
    this.$('input, select').each( function (i, el) {
      var $el = $(el),
          val = $el.val(),
          type = $el.data('unit-type'),
          isSet = (val !== '');

      // if the previous value was empty, and you're trying to increment, do it. if the previous value wasn't empty, and now it's empty, do it as well. otherwise, you would be duplicating the incrementation.
      if ( ($el.data('previous') === '' && val) || ($el.data('previous') !== '' && !val) ) {
        var progress = this.inputProgress[type].get();
        this.inputProgress[type].set(progress + (val ? 1 : -1));
        $el.data('previous', val);
      }
      // set all required fields for upload progress bar; if there's a value, it's no longer required.
      if ($el.hasClass('required')) {
        var name = $el.attr('name');

        this.stillRequired.set(type + '-' + name, isSet);
        rdy &= isSet;
      }
    }.bind(this));
    Results.ready.set('basic', rdy);
  }.bind(this);

  this.inputCount = {
    'string': 0
  };
  this.inputProgress = {
    'string': new ReactiveVar(0)
  };
  this.stillRequired = new ReactiveDict();
});

/// RENDERED ///

Template.basicPane.onRendered( function () {
  this.setReady();
});

Template.textInput.onRendered( function () {
  this.parent().inputCount.string += 1;
  this.$('input').data('previous', '');
});

Template.selectInput.onRendered( function () {
  var $select = this.$('select');

  $select.select2({
    'minimumResultsForSearch': Infinity
  });
  this.parent().inputCount.string += 1;
  $select.data('previous', '');
});

/// HELPERS ///

Template.basicPane.helpers({
  'textInputs': function (index) {
    var crit = {
      'tagType': 'input',
      'unitType': 'string'
    };
    if (!_.isUndefined(index)) {
      _.extend(crit, {'order': index});
    }
    return __getMetrics('basic', 'input', crit);
  },
  'selectInputs': function () {
    return __getMetrics('basic', 'input', {
      'tagType': 'select'
    });
  }
});

/// EVENTS ///

Template.textInput.events({
  'change input': function (evt, tmpl) {
    tmpl.parent().setReady('string');
  }
});
