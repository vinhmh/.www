FROM node:14

WORKDIR /app
ADD bin /app/bin
ADD config /app/config
ADD public /app/public
ADD .babelrc .eslintrc package.json webpack.config.js yarn.lock /app/

RUN yarn install

ENTRYPOINT ["yarn", "start"]
