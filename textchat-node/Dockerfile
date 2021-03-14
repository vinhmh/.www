FROM node:14

WORKDIR /app
ADD bin /app/bin
ADD config /app/config
ADD .babelrc .env.types .eslintrc package.json yarn.lock /app/

RUN yarn install

ENTRYPOINT ["yarn", "start"]
