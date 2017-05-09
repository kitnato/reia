/**
 * REIA - MIT license
 * https://github.com/cneuro/reia
 * client
 * @author Chris Nater
 * */

var cdg = Chart.defaults.global;
// String - Scale label font declaration for the scale label
cdg.scaleFontFamily = '"Hind-Light"';
// String - Point label font declaration
cdg.pointLabelFontFamily = '"Hind-Light"';
// Number - Tooltip label font size in pixels
cdg.tooltipFontSize = 12;
// String - Tooltip title font declaration for the scale label
cdg.tooltipTitleFontFamily = '"Hind-Light"';
// String - Tooltip label font declaration for the scale label
cdg.tooltipFontFamily = '"Hind-Light"';
// String - Tooltip background colour
cdg.tooltipFillColor = "rgba(45,62,79,0.9)";
// Number - Number of animation steps
cdg.animationSteps = 30;
// Boolean - If we want to override with a hard coded scale
cdg.scaleOverride = true;
// Number - The number of steps in a hard coded scale
cdg.scaleSteps = 10;
// Number - The value jump in the hard coded scale
cdg.scaleStepWidth = 1;
// Number - The scale starting value
cdg.scaleStartValue = 0;

if ($(window).width() < 500) {
  // Boolean - whether or not the chart should be responsive and resize when the browser does
  cdg.responsive = true;
}

ChartOptions = {
  'bar': {
    // Boolean - If there is a stroke on each bar
    'barShowStroke' : false
  },
  'radar': {
    // String - Point label font declaration
    'pointLabelFontFamily': '"Hind-Light"'
  },
  'polar-area': {
    'animationSteps': 20
  },
  'line': {
    // Number - Tension of the bezier curve between points
    'bezierCurveTension': 0.2,
    // Number - Pixel width of dataset stroke
    'datasetStrokeWidth': 3,
    // Boolean - Whether to fill the dataset with a colour
    'datasetFill': false
  }
};
