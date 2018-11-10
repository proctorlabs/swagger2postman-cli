#!/bin/bash
docker build -t swagger2postman-cli .
docker run --rm --user $UID:$UID -v $PWD:/opt swagger2postman-cli
