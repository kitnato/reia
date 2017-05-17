/**
 * REIA - MIT license
 * https://github.com/cneuro/reia
 * client
 * @author Chris Nater
 * */

 Template.registerHelper('reactiveVar', function (name) {
   var v = Session.get(name) || Template.instance().get(name).get();

   switch (typeof v) {
     case 'object':
       return v;
       break;
     case 'function':
       return v();
       break;
     default:
       return v;
       break;
   }
 });

Template.registerHelper('isEq', function (x, y) {
  return (x === y);
});
Template.registerHelper('withIndex', function (obj, valID) {
  valID = _.isString(valID) ? valID : 'value';
  return _.map(obj, function (val, i) {
    var mapping = {
      'index': i
    };
    mapping[valID] = val;
    return mapping;
  });
});

Template.registerHelper('categories', function (type) {
  return __getCategories(type);
});
Template.registerHelper('metrics', function (category, type, active) {
  return __getMetrics(
    _.isString(category) ? category : {},
    _.isString(type) ? type : null,
    _.isBoolean(active) ? { 'active': (active ? {'$ne': false} : false) } : {}
  );
});
Template.registerHelper('metricTypes', function () {
  return ['input', 'output'];
});
Template.registerHelper('collectionCount', function (collection) {
  return !collection ? 0 : (_.isArray(collection) ? collection.length : collection.count());
});

Template.registerHelper('roundFixed', function (val, dec) {
  return __roundFixed(val, dec);
});

Template.registerHelper('slugify', function (str) {
  return s.slugify(str);
});
Template.registerHelper('capitalize', function (str) {
  return s.capitalize(str);
});

Template.registerHelper('currentPage', function () {
  return __getCurrentPage();
});

/// DEBUG ///

Template.registerHelper('context', function () {
  console.log('Data context for: ' + Template.instance().view.name);
  console.log('this');
  console.log(this);
  console.log('parent');
  console.log(Template.parentData());
  console.log('grand-parent');
  console.log(Template.parentData(2));
});

Template.registerHelper('console', function (v) {
  console.log(v);
});
