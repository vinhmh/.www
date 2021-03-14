#!/bin/bash

npx babel . -d ./dist --ignore node_modules,public,views,src --delete-dir-on-start --verbose
ln -s ./views ./dist --relative
ln -s ./public ./dist --relative
ln -s ./shared ./dist --relative
ln -s ./config/settings.yml ./dist/config/settings.yml --relative
