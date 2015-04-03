UofT Course API
==============
This is a service that is currently in development by [Qasim Iqbal](https://github.com/Qasim) and [Ivan Zhang](https://github.com/ivanzhangsolutions).

The goal is to provide a RESTful web API that can allow developers to create applications to help make course selection easier for students at UofT.

We want our database to be self-sufficient (fully automated, with no user-required actions). We also want the API itself to be easy to understand and use, but yet still very comprehensive in what it can provide to a developer.

Web Scraper
---------------
We are working on web scrapers for the following web services that are provided by UofT:

 - [Course Finder](http://coursefinder.utoronto.ca/)
 - [A&S Fall/Winter Timetable](http://www.artsandscience.utoronto.ca/ofr/timetable/winter/sponsors.htm) + [A&S Summer Timetable](http://www.artsandscience.utoronto.ca/ofr/timetable/summer/sponsors.htm)
 - [UTM Timetable Planner](https://student.utm.utoronto.ca/timetable/)
 - [UTSC Course Timetable](http://www.utsc.utoronto.ca/~registrar/scheduling/timetable)

Each scraper should have the following properties:

 1. A python file that holds the class for the specific scraper.
 2. A folder called “html” that holds all the raw HTML.
 3. A folder called “json” that holds all the formatted JSON for each course that has been scraped.
	- It should be named in respect to the course_id parameter which we will keep universal (eg. CSC108H1F20149.json)
	- It should fill as much of the course schema as it can
```js
{
  id: String,
  code: String,
  name: String,
  description: String,
  division: String,
  department: String,
  prerequisites: String,
  exclusions: String,
  level: Number,
  campus: String,
  term: String,
  breadths: [Number],
  meeting_sections: [{
    code: String,
    instructors: [String],
    times: [{
      day: String,
      start: Number,
      end: Number,
      duration: Number,
      location: String
    }],
    size: Number,
    enrolment: Number
  }]
}
```

Web API
----------
There are 3 endpoints for the course API.

* `GET courses/show/:id`
    - Gets the course document at the specified id
    - eg. `CSC108H1F20149`

* `GET courses/search?q=<QUERY>`
    - Performs a fuzzy search on courses based on the query presented
    - eg. `q=natural language computing`

* `GET courses/filter?q=<QUERY>`
    - Filters courses based on a provided query in a format
    - eg. `q=breadth:'1' AND level:'<=200' OR code:'CSC'`

For any numerical or time parameter in the "filter" endpoint:
 - "**>**" indicates **GREATER THAN** (eg. `class_size:'>30'`)
 - "**<**" indicates **LESS THAN** (eg. `start_time:'<18:00'`)
 - "**>=**" indicates **GREATER THAN OR EQUAL TO** (eg. `class_enrolment:'>=1'`)
 - "**<=**" indicates **LESS THAN OR EQUAL TO** (eg. `course_level:'<=200'`)
 - No operator indicates **EQUAL TO** (eg. `breadth:'5'`)

For any string parameter:
 - No operator indicates **CONTAINS** (eg. `code:'CSC'`)
 - “**-**” indicates **NOT** (eg. `department:'-architecture'`)

**AND** and **OR** can be combined, with **AND** taking precedence.

TODO: Add descriptions of each parameter
