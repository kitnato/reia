/**
 * REIA - MIT license
 * https://github.com/cneuro/reia
 * client
 * @author Chris Nater
 * */

/// CREATED ///

Template.project.onCreated( function () {
  Results.ready.reset();
  Results.score.reset();
  Results.rating.reset();

  this.subscribe('metrics');
  this.subscribe('charts');
});

/// RENDERED ///

Template.projectTabContent.onRendered( function () {
  __onTabVisible(this, function () {
    // refresh auto metrics in case tab is returned to
    $('.tab-pane.active .metric.auto .metric-input').change();
  }.bind(this));
});

/// HELPERS ///

Template.projectTabBadge.helpers({
  'ready': function () {
    return Results.ready.state.get(this.category);
  }
});

/// EVENTS ///

Template.projectNavButton.events({
  'click .previous-category': function () {
    var i = $('#nav-categories li.active').index();
    $('#nav-categories li').eq(i - 1).find('a').tab('show');
  },
  'click .next-category': function () {
    var i = $('#nav-categories li.active').index();
    $('#nav-categories li').eq(i + 1).find('a').tab('show');
  }
});
