FROM node:14

RUN mkdir /home/node/app/
WORKDIR /home/node/app

COPY package*.json ./

RUN npm install && npm cache clean --force --loglevel=error

COPY app app
COPY config config

ENV PORT 8080

CMD ["npm", "start"]