UofT Building API
=================

This is a RESTful web API built to interface with the University of Toronto buildings accross all 3 campuses.
It is developed as part of a collection of public data APIs for UofT called [Cobalt](https://github.com/cobalt-io).

There are 3 endpoints for the building API. (optional parameters are within square brackets)

* `GET buildings/list[?limit=<LIMIT>&skip=<SKIP>]`
    - Gets a list of buildings

* `GET buildings/show/:id`
    - Gets the building document at the specified id
    - eg. `001`

* `GET buildings/search?q=<QUERY>[&limit=<LIMIT>&skip=<SKIP>]`
    - Performs a fuzzy search on buildings based on the query presented
    - eg. `q=bahen`
