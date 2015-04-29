UofT Food API
=================

This is a RESTful web API built to interface with the University of Toronto food vendor locations accross all 3 campuses.
It is developed as part of a collection of public data APIs for UofT called [Cobalt](https://github.com/cobalt-io).

There are 3 endpoints for the food API. (optional parameters are within square brackets)

* `GET food/list[?limit=<LIMIT>&skip=<SKIP>]`
    - Gets a list of food vendors

* `GET food/show/:id`
    - Gets the food vendor document at the specified id
    - eg. `001`

* `GET food/search?q=<QUERY>[&limit=<LIMIT>&skip=<SKIP>]`
    - Performs a fuzzy search on food vendors based on the query presented
    - eg. `q=pizza`
