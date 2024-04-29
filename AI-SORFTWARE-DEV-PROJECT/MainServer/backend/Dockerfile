ARG PORT=5000

FROM node:alpine3.19

WORKDIR /app

COPY . .

RUN npm install

RUN npm run build

RUN npm run migration:run

EXPOSE $PORT

CMD ["npm","run","start:prod"]