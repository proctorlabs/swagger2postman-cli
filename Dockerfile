FROM node:11-alpine
RUN mkdir build
ADD package.json .
RUN npm install
ADD swagger-to-postman.js .
ENTRYPOINT [ "node", "swagger-to-postman.js" ]
