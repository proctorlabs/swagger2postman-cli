# swagger2postman-cli

A Docker based utility for converting swagger (OpenAPI v2) documents to postman collections

``` bash
swagger2postman-cli: Tool for converting Swagger v2 (OpenAPI v2) documents to postman collections.
Intended to run with Docker!

Usage:
docker run --rm --user $UID:$UID -v $PWD:/opt philproctor/swagger2postman-cli <flags>

Flags:
      --file                      The input filename to use.
      --output                    The base output name to use for generated collections
      --env.<name>.<var>          Generate output for environment <name>. Ensure <var> is set to this value
      --header.<name>             Globally set this header to the value specified
      --basepath                  Set the variable name to use for basepath instead of using the definition
      --pretty                    Pretty-print the JSON output
      --prerequest.global         Global prerequest script to use in generated collection

e.g.
docker run --rm --user $UID:$UID -v $PWD:/opt philproctor/swagger2postman-cli \
'--env.Dev Environment.host=localhost' --file=swagger.json '--header.Accept=application/json' \
'--header.Content-Type: application/json' --output=petstore

```

swagger2-postman-generator is used to generate the Postman environments.

swagger2postman2 is used to generate collections.