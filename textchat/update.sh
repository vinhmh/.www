#!/bin/bash -l

ENV="$1"
APP_DIR="/home/app/apps/textchat"
DIR=$(pwd)

cd $APP_DIR

. ~/.nvm/nvm.sh
. ~/.profile
. ~/.bashrc

nvm use
yarn
NODE_ENV=$ENV yarn run build
