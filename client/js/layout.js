/**
 * REIA - MIT license
 * https://github.com/cneuro/reia
 * client
 * @author Chris Nater
 * */

Template.layout.events({
  // only initialize the popover when needed
  'mouseenter [data-toggle="popover"]': function (evt, t) {
    var $trigger = $(evt.currentTarget);
    // only initialize once
    if ( !_.isUndefined($trigger.data('bs.popover')) ) {
      return false;
    }

    var content = _.bind( function () {
      var c = this.description;
      // add sources, if applicable
      if (this.sources) {
        c += '<br><br>';
        _.each(this.sources, function (source) {
          c += $(document.createElement('div')).addClass('source').text(source.description).get(0).outerHTML;
        });
      }
      return c;
    }, this),
    templateContent = Template[$trigger.data('popover-template')];

    $trigger.popover({
      'html': true,
      'container': 'body',
      // either it's HTML from a metric template's description data context, or a template name is defined from which to fetch it
      'content': templateContent ? Blaze.toHTML(templateContent) : content
    });

    // dynamically add class to popover based on data attributes for styling purposes
    var pClass = $trigger.data('popover-class');
    if (pClass) {
      $trigger.data('bs.popover').tip().addClass(pClass);
    }
    if ($trigger.attr('role') !== 'button') {
      $trigger.popover('show');
    }
  }
});
