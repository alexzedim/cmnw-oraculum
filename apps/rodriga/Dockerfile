FROM node:lts

ARG CR_PAT
ENV CR_PAT=$CR_PAT

LABEL org.opencontainers.image.title = "Rodriga"
LABEL org.opencontainers.image.vendor = "AlexZeDim"
LABEL org.opencontainers.image.url = "https://i.imgur.com/CY0Kqy3.png"
LABEL org.opencontainers.image.source = "https://github.com/AlexZeDim/cmnw-oraculum"

RUN apt-get update

RUN apt-get install -y git

WORKDIR /usr/src/app

RUN npm install -g @nestjs/cli

RUN git config --global url."https://alexzedim:${CR_PAT}@github.com/".insteadOf "https://github.com/"

RUN git clone https://github.com/AlexZeDim/oraculum-secrets.git

RUN mv oraculum-secrets/* .

RUN rm -rf oraculum-secrets-secrets

COPY package.json ./

RUN yarn install

COPY . .

RUN nest build rodriga

CMD wait && ["node", "dist/apps/rodriga/main.js"]



