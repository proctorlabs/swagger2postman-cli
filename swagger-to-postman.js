var Swagger2Postman = require("swagger2-postman-generator");

var fileToProcess = process.env.FILE

Swagger2Postman
    .convertSwagger()
    .fromFile("./" + fileToProcess)
    .toPostmanCollectionFile("./" + fileToProcess + ".postman_collection")
