#!/usr/bin/env bash

cd "`dirname "$0"`"
cd ../..
export METEOR_HOME=`pwd`

# Just in case these packages haven't been installed elsewhere.
./meteor npm install -g puppeteer@1.3.0 phantomjs-prebuilt browserstack-webdriver

export PATH=$METEOR_HOME:$PATH
# synchronously get the dev bundle and NPM modules if they're not there.
./meteor --help || exit 1

export URL='http://localhost:4096/'

exec 3< <(meteor test-packages --driver-package test-in-console -p 4096 --exclude ${TEST_PACKAGES_EXCLUDE:-''})
EXEC_PID=$!

sed '/test-in-console listening$/q' <&3
dev_bundle/lib/node_modules/puppeteer/index.js "$METEOR_HOME/packages/test-in-console/runner.js"
STATUS=$?

pkill -TERM -P $EXEC_PID
exit $STATUS