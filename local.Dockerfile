FROM node:18.14-alpine3.12

LABEL org.opencontainers.image.title = "CMNW-ORACULUM"
LABEL org.opencontainers.image.vendor = "AlexZeDim"
LABEL org.opencontainers.image.url = "https://i.imgur.com/CY0Kqy3.png"
LABEL org.opencontainers.image.source = "https://github.com/AlexZeDim/cmnw-oraculum"

WORKDIR /usr/src/app

RUN npm install -g @nestjs/cli

COPY package.json ./
RUN yarn install

COPY . .

RUN nest build rainy \
  && nest build fefenya \
  && nest build pepa-chat-git

CMD wait && ["node"]
