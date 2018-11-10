'use strict';

const args = require('yargs').argv;
var Swagger2Postman = require("swagger2-postman-generator");

var fileToProcess = args.file

if (!fileToProcess) {
    console.log(
"swagger2postman-cli: \
Tool for converting Swagger v2 (OpenAPI v2) documents to postman collections.\n\
Intended to run with Docker!\n\
\n\
Usage:\n\
docker run --rm --user $UID:$UID -v $PWD:/opt philproctor/swagger2postman-cli <flags>\n\
\n\
Flags:\n\
      --file                      The input filename to use.\n\
      --output                    The base output name to use for generated collections\n\
      --env.<name>.<var>          Generate output for environment <name>. Ensure <var> is set to this value\n\
      --header.<name>             Globally set this header to the value specified\n\
")
    return 0
}

var fileOutput = args.output ? args.output : args.file
var headers = []
var envMap = args.env
var envs = []

for (var envName in envMap) {
    var vars = []
    for (var varName in envMap[envName]) {
        vars.push({
            key: varName,
            value: envMap[envName][varName]
        })
    } 
    envs.push({
        name: envName,
        customVariables: vars
    })
}

for (var headerName in args.header) {
    headers.push(headerName + ": " + args.header[headerName])
}

console.log("Generating " + fileOutput + ".postman_collection")
Swagger2Postman
    .convertSwagger()
    .fromFile("/opt/" + fileToProcess)
    .toPostmanCollectionFile("/opt/" + fileOutput + ".postman_collection", {
        globalHeaders: headers
    });

for (var i = 0; i < envs.length; i++) {
    console.log("Generating " + fileOutput + "." + envs[i].name + ".postman_environment")
    Swagger2Postman
        .convertSwagger()
        .fromFile("/opt/" + fileToProcess)
        .toPostmanEnvironmentFile("/opt/" + fileOutput + "." + envs[i].name + ".postman_environment", {
            environment: envs[i]
        })
}

console.log("Done!")