FROM node:11-alpine
RUN mkdir build
ADD package.json .
ADD package-lock.json .
RUN npm ci
ADD swagger-to-postman.js .
ENTRYPOINT [ "node", "swagger-to-postman.js" ]
