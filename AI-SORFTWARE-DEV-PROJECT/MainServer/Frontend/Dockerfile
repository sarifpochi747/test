ARG PORT=4200

FROM node:alpine3.19 as builder

WORKDIR /app

COPY . .

RUN npm install

RUN npm run build

FROM nginx:latest

COPY --from=builder /app/dist/facetrack /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE $PORT