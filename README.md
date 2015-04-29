Cobalt @ UofT [![Slack][slackin-badge]][slackin] [![Circle CI][circleci-badge]][circleci]
=============
This is a service that is currently in development.

The mission is to provide a collection of RESTful web APIs that can allow developers to create applications or services that utilize public data from the University of Toronto.

Web APIs
----------
The APIs are being made to be easy to understand and very comprehensive in what it can provide to a developer. In order to achieve this, we are actively contacting developers at UofT to see what use cases are needed in each API. Along with this, market research is performed to allow us to understand the viability of certain end points. We are working on the following web APIs for Cobalt:

  - [x] [UofT Course API](https://github.com/cobalt-io/cobalt/tree/master/api/courses)
  - [x] [UofT Building API](https://github.com/cobalt-io/cobalt/tree/master/api/buildings)
  - [ ] [UofT Food API](https://github.com/cobalt-io/cobalt/tree/master/api/food)

We encourage your feedback on our progress!

Web Scrapers
---------------
The databases are being developed to allow for fully automated curation. In order to do this, an intricate [scraping module](https://github.com/cobalt-io/uoft-scrapers) is also in development. We are working on scrapers for the following web services that are provided by UofT:

 - [x] [Course Finder](http://coursefinder.utoronto.ca/) 
 - [x] [A&S Fall/Winter Timetable](http://www.artsandscience.utoronto.ca/ofr/timetable/winter/sponsors.htm) + [A&S Summer Timetable](http://www.artsandscience.utoronto.ca/ofr/timetable/summer/sponsors.htm)
 - [ ] [UTM Timetable Planner](https://student.utm.utoronto.ca/timetable/)
 - [ ] [UTSC Course Timetable](http://www.utsc.utoronto.ca/~registrar/scheduling/timetable)
 - [x] [UofT Map](http://map.utoronto.ca)

Wiki
----

Check out the [wiki](https://github.com/cobalt-io/cobalt/wiki) for developer information.

[slackin]: https://cobalt-slack.herokuapp.com/
[slackin-badge]: https://cobalt-slack.herokuapp.com/badge.svg
[circleci]: https://circleci.com/gh/cobalt-io/cobalt
[circleci-badge]: https://circleci.com/gh/cobalt-io/cobalt.svg?style=svg
