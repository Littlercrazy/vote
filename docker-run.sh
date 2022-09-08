#! /bin/sh

set -e

if [ -n $NODE_ENV ]; then
  echo $NODE_ENV
#  agenthub start agent-config.json
else
  echo "no node env find"
fi

if [ -n $NODE_TYPE ]; then
  echo $NODE_TYPE
#  agenthub start agent-config.json
else
  echo "no node type find"
fi

exec node ./dist/src/$NODE_TYPE/main.js
