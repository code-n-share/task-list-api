# install node.js image
FROM node:16.14.2-alpine3.15

# set working dir
WORKDIR /home/src/app

## Copies package.json, package-lock.json, tsconfig.json to the root of WORKDIR
COPY ["package.json", "package-lock.json", "tsconfig.json", ".env", "./"]

COPY ./src ./src

# install all packages
RUN npm i

CMD npm start