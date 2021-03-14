#!/bin/bash -l

ENV="$1"
APP_DIR="/home/app/apps/webphone-node"
DIR=$(pwd)
cd $APP_DIR

. ~/.profile
. ~/.bashrc

export $(cat .env | xargs)
yarn
NODE_ENV=$ENV yarn run build
