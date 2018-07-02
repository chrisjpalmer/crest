FROM node:8.11.3-alpine

RUN apk add --update python python-dev build-base

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

ENTRYPOINT ["npm", "start", "--"]

CMD ["--config", "/config.json"]