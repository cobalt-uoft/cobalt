#!/bin/bash

mkdir -p node_modules

cd node_modules
git clone https://github.com/cobalt-io/user.git
git clone https://github.com/cobalt-io/uoft-course-api.git
git clone https://github.com/cobalt-io/uoft-building-api.git
git clone https://github.com/cobalt-io/uoft-food-api.git

cd ..
npm install

echo Cobalt build complete