'use strict';

const args = require('yargs').argv;
var Swagger2Postman = require("swagger2-postman-generator");
var Swagger2Postman2 = require("swagger2-postman2-converter")
var PostmanCollections = require("postman-collection")
var fs = require("fs");
var http = require('https');

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
      --prerequest.global         Global prerequest script to use in generated collection\n\
      --apikey                    API Key to used for uploading collection to Postman servers. Requires --collection\n\
      --collection                Collection ID to update. Requires --apikey\n\
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
var apiKey = args.apikey
var collection = args.collection

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

console.log('Reading swagger spec...')
var spec = JSON.parse(fs.readFileSync("/opt/" + fileToProcess))
spec.host = '{{host}}'

if (args.basepath !== undefined) {
    if (args.basepath == '') {
        delete(spec.basePath)
    } else {
        spec.basePath = '/{{' + args.basepath + '}}'
    }
}

console.log("Generating postman collection...")
var result = Swagger2Postman2.convert(spec)
if (!result.status) {
    console.log("Failed to convert Swagger!")
    console.log(result.reason)
    return
}

if (args.prerequest && args.prerequest.global) {
    result.collection.event.push(new PostmanCollections.Event({
        listen: "prerequest",
        script: fs.readFileSync("/opt/" + args.prerequest.global).toString()
    }))
}

if (apiKey && collection) {
    console.log("Updating published collection...")
    var postdata = JSON.stringify({
        'collection': result.collection
    }, null, spacing)
    var postRequest = http.request('https://api.getpostman.com/collections/' + collection, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': apiKey,
            'Content-Length': Buffer.byteLength(postdata)
        }
    }, function (res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            console.log('Response: ' + chunk);
        });
    })
    postRequest.write(postdata)
    postRequest.end()
} else {
    console.log("Writing " + fileOutput + ".postman_collection.json")
    fs.writeFileSync("/opt/" + fileOutput + ".postman_collection.json", JSON.stringify(result.collection, null, spacing), 'utf8')
}

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