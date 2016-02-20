# Cobalt @ University of Toronto [<img src="https://avatars0.githubusercontent.com/u/10912859" width="20" height="20" />](https://cobalt.qas.im)

[![npm version](https://badge.fury.io/js/cobalt-uoft.svg)](https://www.npmjs.com/package/cobalt-uoft)
[![Build Status](https://travis-ci.org/cobalt-uoft/cobalt.svg?branch=master)](https://travis-ci.org/cobalt-uoft/cobalt)
[![Coverage Status](https://coveralls.io/repos/github/cobalt-uoft/cobalt/badge.svg?branch=master)](https://coveralls.io/github/cobalt-uoft/cobalt?branch=master)
[![Join the chat at https://gitter.im/cobalt-uoft/cobalt](https://badges.gitter.im/cobalt-uoft/cobalt.svg)](https://gitter.im/cobalt-uoft/cobalt?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Cobalt provides a collection of open data APIs that allow anyone to interface with public information from the University of Toronto in their applications or services.

[Sign up](https://cobalt.qas.im/signup) to use the APIs immediately, or run Cobalt on your own server using this NPM package.

## Requirements

Ensure that the following software has been installed on your server:

* [Node.js](https://nodejs.org/) ^5.6 ([nvm](https://github.com/creationix/nvm) recommended)
* [MongoDB](https://www.mongodb.org/) ^3.0.2

## Installation

Verify that MongoDB is installed and running. Refer to the [MongoDB installation guide](https://docs.mongodb.org/manual/installation/) for more information.

Next, install Cobalt.

```
$ npm install -g cobalt-uoft
```

You'll need to set the following environment variable (refer to [this guide](http://www.schrodinger.com/kb/1842) if you're unsure how to do so).

* `COBALT_MONGO_URI` : the MongoDB connection URI used to connect to your MongoDB database server (ex. `mongodb://localhost/cobalt`). This database will have Cobalt's datasets synced to it automatically when you run Cobalt.

## Usage

To start your local instance:

```
$ cobalt
```

That's it! Cobalt should now be running on `http://localhost:4242`. You can also specifiy a different port to listen on via the `-p` command line argument (ex. `$ cobalt -p 3000`).

Use Cobalt as you normally would, under the new URL that is outputted during startup. No API key is required to authenticate requests on your local server.

#### Using Cobalt in an existing Express project

You can also create an instance of Cobalt in an existing Node.js project that uses [Express](http://expressjs.com/).

```js
var express = require('express');
var cobalt = require('cobalt-uoft');

var app = express();

var port = process.env.PORT || 4242;

// Serve the Cobalt APIs on the /cobalt URL prefix
app.use('/cobalt', cobalt.Server);

// Hello world
app.get('/', function(req, res) {
  res.status(200).send('Hello, world!');
});

app.listen(port, function() {
  console.log('Server running on port ' + port + '.');
});
```

## Updating

```
npm update -g cobalt-uoft
```
