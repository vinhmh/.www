#!/bin/bash -l

ENV="$1"
APP_DIR="/home/app/apps/webphone"
DIR=$(pwd)
cd $APP_DIR

. ~/.nvm/nvm.sh
. ~/.profile
. ~/.bashrc

export $(cat .env | xargs)
nvm use
yarn
NODE_ENV=$ENV yarn run build
