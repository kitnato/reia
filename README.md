REIA - Renewable Energy Impact Analytics
===

REIA is a data-driven Web-tool that allows a renewable energy (RE) project's data to be generalised, scored and visualised across different categories, outcomes and performance metrics.

At its core is a [JSON](http://www.json.org/) data framework application based on international RE standards that provides a consistent assessment methodology across multiple project development stages and technology types. Its entire configuration is as extensible and malleable as it is transparent.

REIA is built with [Meteor](https://www.meteor.com/) & [Bootstrap](http://getbootstrap.com/) in [Atom](https://atom.io/) according to [ES5](https://es5.github.io/) specifications.

The `master` branch is live on http://reia.io.

## Why?

An attempt at an open-source, community-driven standards framework, REIA aims to facilitate RE developers in assessing relevant impacts of their project according to their own requirements efficiently while retaining consistency of methodology.

### Core pillars

1. **Configurable** - Every input or output metric can be configured in terms of (in sequence):
  1. how its data, sources and outcome are defined,
  1. if it is activated in the category (or not),
  1. how it is scored across its spectrum of possible values, and
  1. how it is weighted as a whole in the category with respect to that category's other metrics.
1. **Automatable** - every output can by definition be automated using the project's inputs with a custom calculation syntax, allowing for complex computable interactions between metrics.
1. **Transparent** - every metric and category score is dependent on what metrics are activated and how they are weighted, allowing a project to be rated according to its individual requirements whilst providing full disclosure of the methodology.

> *For projects to be compared with one another usefully, a particular configuration needs to be consistent across those projects.*

## Terminology

The fundamental concepts that REIA codifies into the framework. For more detailed how-tos, please refer to the front-end popovers marked by question marks.

### Metric

A project's isolated, pre-defined, discretized set of data. The values a metric has can by definition be mapped to a linear function. Metric values can take the form of numbers corresponding to a unit, or any discrete, finite dataset. Metrics are a core configurable aspect and are by design highly extensible.

A metric can score from 0 (worst performance/outcome) to 10 (best). There are currently 51 metrics across all categories.

> For example, technical metric "Nameplate Capacity" is a number in the range of 1 to 500 in MW, while environmental metric "Impact on Local Landscape" takes the form of a nested radio list of choices.

Metrics are defined in `private/metrics/` by category folder. Also see **Further development**.

#### Input

A given property of the project and cannot be inferred in any other way, such as its generating capacity.

#### Output

Conceptually differs from an input because it could be derived from existing inputs. If sufficient inputs are present, then an output can be automated using a calculation.

#### Calculation

Powers the automation of an output. An output's automation can be individually switched on or off on the front-end.

A calculation is expressed as an algebraic combination of other metrics and constants, using standard ASCII math notation and a custom camelCase syntax as follows:

`[categoryName][metricType][metricName][OPERATION]...`

> For example, the calculation for "Annual Output" is defined as:

> `technicalInputNameplateCapacity*(technicalInputCapacityFactor/100)*8760`

#### Activation

To facilitate the re-use and aggregation of metrics as a comprehensive database, metrics can individually be activated or deactivated, including or excluding them completely from all evaluations of a particular project. Also see **Category Coverage**.

#### Weight

Confers relative importance to metrics compared to their peers in a particular category.

The weight takes the form of a percentage coefficient that, along with the other metric's weights, combines into a linear [weighted arithmetic mean](https://en.wikipedia.org/wiki/Weighted_arithmetic_mean). The weights for all metrics default to equivalent values of their convex combination for the sum of all active metrics.

> For example, 5 active metrics in a category each have a default weight of 0.2 (each being 20% worth of the category 100% total).

> *v0.1 infers equal weights across all active metrics, so the UI field is indicative and changing JSON files won't have any effect.*

### Category

Loosely groups a set of metrics by application domain. There are currently 4 categories, each bearing a possible rating from A (best performance/outcome) to F (worst). The rating is derived from a weighted arithmetic mean of all of its active metrics.

#### Basic (unrated)

Doesn't include any metrics, only the supporting contextual information of the project, such as name, location and development stage.

#### Technical

A crucial aspect, the technical metrics represent the technological performance of the RE project.

#### Financial

Arguably the most important category, financial metrics complement feasibility reports and ROI projections.

#### Environmental

Strives to measure the outcomes of the project's impact on the environment, such as emissions and water pollution.

> *In v0.1 the inclusion and content of the metrics in this category are experimental, and the potential for output automation in need of further development*

#### Socioeconomic

The most experimental and perhaps least standardised of metrics - the idea is to quantify the impact of the project on equity, local lifestyles and job quality, among other things.

> *As with the environmental category, v0.1 requires further development for the content and automation of the socioeconomic metrics*

#### Coverage

Refers to what percentage of that category's total defined metrics are activated for this particular project. It doesn't influence any evaluation, but it's a crucial piece of holistic project data.

This aspect is computed and shown on the front-end in the form of a progress bar.

#### Rating

Based on the arithmetic mean score of a category's activated metrics according to their relative weightings, broken up by 0.5 point increments. If the average is in the lower tier, a "-" suffix is added, if in the middle tier, no suffix is added and if in the upper tier, a "+" suffix is added, much like in a school report card.

- **F** - score of under 1
- **E** - between 1 and 3
- **D** - between over 3 and 5
- **C** - between over 5 and 7
- **B** - between over 7 and 9
- **A** - over 9 (can't be more than 10)

> For example, a category scoring 5.4 translates to a rating of C-, while a score of 8.6 is a B+.

The project's overall rating is the linear arithmetic mean of all the category's ratings. Also see **Further development**.

### Chart

Serves to visualise scores and ratings for metrics and categories. Charts are defined as JSON files in `private/charts` by category folder using a custom data model. They are processed and displayed via [Chart.js](http://www.chartjs.org/) in the front-end.

## Internals

*Forthcoming*

## Further development

As of v0.1, useful additions include:

- Extending the UI so that configuration can be done completely on the front-end instead of having to change JSON files manually
- Making the environmental & socioeconomic categories more robust
- Functionality for exporting a detailed JSON file and (ultimately) PDF of a project and its configuration
- Weight system:
 - custom metric weights, no longer inferring equal weights
 - addition of weights between categories to allow for overall rating
- Allowing for more flexible, auto-mapped rating scales based on a range of values rather than a finite set
- User accounts system to allow in-app saving of configuration and projects
- Validation:
 - activated, automated outputs can never take into account deactivated inputs
 - validation of custom weights (UI-driven for best outcome)
- Full code documentation

> There is no reason why REIA can't be extended to also include non-renewable technology types. It's would be a matter of including the appropriate metrics and broadening the focus. In addition, a system could be implemented to systematically exclude certain metrics based on the selected technology type without affecting coverage.

## About

The concepts behind REIA were devised by [Phillip Bruner](https://www.linkedin.com/in/pbruner/) and developed by [Chris Nater](https://www.linkedin.com/in/cnater/) in collaboration with several industry professionals, institutions and academic experts.

REIA is licensed under the MIT license, see `LICENSE`.
