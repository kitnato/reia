/**
 * REIA - MIT license
 * https://github.com/cneuro/reia
 * client
 * @author Chris Nater
 * */

Template.ratings.helpers({
  'metrics': function () {
    return __getCategories('metric');
  },
  'rating': function (category) {
    return Results.rating.stateDisplay.get(category) || '?';
  }
});
