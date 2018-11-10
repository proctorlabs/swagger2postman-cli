'use strict';

const args = require('yargs').argv;
var Swagger2Postman = require("swagger2-postman-generator");
var fs = require("fs");

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
      --basepath                  Set the variable name to use for basepath instead of using the definition\n\
\n\
e.g.\n\
docker run --rm --user $UID:$UID -v $PWD:/opt philproctor/swagger2postman-cli \\\n\
'--env.Dev Environment.host=localhost' --file=swagger.json '--header.Accept=application/json' \\\n\
'--header.Content-Type: application/json' --output=petstore\n\
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

var spec = JSON.parse(fs.readFileSync("/opt/" + fileToProcess))

if (args.basepath !== undefined) {
    if (args.basepath == '') {
        console.log('Deleted basepath')
        delete(spec.basePath)
    } else {
        console.log('Set basepath')
        spec.basePath = '/{{' + args.basepath + '}}'
    }
}

console.log("Generating " + fileOutput + ".postman_collection")
Swagger2Postman
    .convertSwagger()
    .fromSpec(spec)
    .toPostmanCollectionFile("/opt/" + fileOutput + ".postman_collection", {
        globalHeaders: headers
    });

for (var i = 0; i < envs.length; i++) {
    console.log("Generating " + fileOutput + "." + envs[i].name + ".postman_environment")
    Swagger2Postman
        .convertSwagger()
        .fromSpec(spec)
        .toPostmanEnvironmentFile("/opt/" + fileOutput + "." + envs[i].name + ".postman_environment", {
            environment: envs[i]
        })
}

console.log("Done!")