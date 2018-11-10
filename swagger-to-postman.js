'use strict';

const args = require('yargs').argv;
var Swagger2Postman = require("swagger2-postman-generator");
var Swagger2Postman2 = require("swagger2-postman2-converter")
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
      --pretty                    Pretty-print the JSON output\n\
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
var spacing = args.pretty ? 2 : null

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
spec.host = '{{host}}'

if (args.basepath !== undefined) {
    if (args.basepath == '') {
        delete(spec.basePath)
    } else {
        spec.basePath = '/{{' + args.basepath + '}}'
    }
}

console.log("Generating " + fileOutput + ".postman_collection.json")
var result = Swagger2Postman2.convert(spec)
if (!result.status) {
    console.log("Failed to convert Swagger!")
    console.log(result.reason)
    return
}
fs.writeFileSync("/opt/" + fileOutput + ".postman_collection.json", JSON.stringify(result.collection, null, spacing), 'utf8')

for (var i = 0; i < envs.length; i++) {
    console.log("Generating " + fileOutput + "." + envs[i].name + ".postman_environment.json")
    var envToWrite = Swagger2Postman
        .convertSwagger()
        .fromSpec(spec)
        .toPostmanEnvironment({
            environment: envs[i]
        })
    fs.writeFileSync("/opt/" + fileOutput + "." + envs[i].name + ".postman_environment.json", JSON.stringify(envToWrite, null, spacing), 'utf8')
}

console.log("Done!")