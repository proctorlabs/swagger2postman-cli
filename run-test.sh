#!/bin/bash
docker build -t swagger2postman-cli .

echo Test usage printing
docker run --rm swagger2postman-cli
sleep 2

echo Test headers
docker run --rm --user $UID:$UID -v $PWD/test:/opt swagger2postman-cli --file=swagger.json '--header.Accept=application/json' '--header.Content-Type: application/json'
sleep 2

echo Test custom output filename
docker run --rm --user $UID:$UID -v $PWD/test:/opt swagger2postman-cli --file=swagger.json --output=boomboom
sleep 2

echo Test custom basepath
docker run --rm --user $UID:$UID -v $PWD/test:/opt swagger2postman-cli --file=swagger.json --basepath=basePath --pretty=t
sleep 2

echo Test import JS
docker run --rm --user $UID:$UID -v $PWD/test:/opt swagger2postman-cli --file=swagger.json --prerequest.global=prerequest.js --pretty=t
sleep 2

echo Test multiple environments, some with spaces in name
docker run --rm --user $UID:$UID -v $PWD/test:/opt swagger2postman-cli --pretty=t --env.test.port=85 --env.test.host=hostname '--env.Test 2.host=Some Value' --file=swagger.json
sleep 2

echo Test all features together
docker run --rm --user $UID:$UID -v $PWD/test:/opt swagger2postman-cli --env.test.host=hostname '--env.Test 2.host=Some Value' --file=swagger.json '--header.Accept=application/json' '--header.Content-Type: application/json' --output=outname
