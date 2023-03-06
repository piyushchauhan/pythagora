#!/usr/bin/env node
let { checkDependencies } = require('./src/helpers/starting.js');
try {

    require.cache[require.resolve('express')] = {
        exports: require('./src/patches/express.js')
    };

    require.cache[require.resolve('../../mongodb/lib/collection.js')] = {
        exports: require('./src/patches/mongo-collection.js')
    };

    require.cache[require.resolve('../../mongodb/lib/mongo_client.js')] = {
        exports: require('./src/patches/mongo-client.js')
    };

    checkDependencies();
} catch (e) {
    console.log(`\x1b[31m${e.stack}\x1b[0m`);
    process.exit(1);
}

let { mode, initScript } = require('./src/utils/argumentsCheck.js');
const Pythagora = require('./src/Pythagora.js');

const path = require('path');

global.Pythagora = new Pythagora(mode);

process.on('uncaughtException', (error) => {
    console.error('The app has crashed!');
    console.error('This is likely not related to Pythagora, but the app itself.');
    console.error(error);
    process.exit(1);
});

(async () => {
    await global.Pythagora.runRedisInterceptor();
    require(path.join(process.cwd(), initScript));

    if (mode === 'test') {
        console.log('Running tests in 3 seconds...');
        setTimeout(() => {
            require('./RunPythagoraTests.js');
        }, 3000);
    }
})();

