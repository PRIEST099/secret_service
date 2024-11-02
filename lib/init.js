const fs = require('fs');
const { input, confirm, checkbox } = require('@inquirer/prompts');
const dotenv = require('dotenv');

const { get, create, update, remove } = require('./crud');

dotenv.config();

const ENV_PATH = '.env';

async function init(mode) {
    if (mode === 'dev') {
        console.log('initializing development mode\n');
        // local development setup
        setupLocalEnv();
    } else if (mode === 'prod') {
        console.log('initializing production mode\n');
        // production env setup
        await setupProductionEnv();
    } else {
        throw new Error('Invalid mode. Use "dev" or "prod" for intiialization...');
    }

    return { get, create, update, remove };
}

function setupLocalEnv(){
    if (fs.existsSync(ENV_PATH)) {
        console.log('.env file found.');
    } else {
        const devEnv = 'ENV=development\nAPI_URL=http://localhost:5000';

        fs.writeFileSync(ENV_PATH, devEnv);
        console.log('.env file created for development mode.');
    }


    // Load .env variables initially
    dotenv.config();

    // Watch for changes to .env file
    fs.watch(ENV_PATH, (eventType, filename) => {
        if (eventType === 'change') {
            console.log(`Detected change in ${filename}. Reloading environment variables...`);
            dotenv.config();  // Reload environment variables
            console.log('Environment variables updated:');
        }
    });

}


async function setupProductionEnv() {
    if (fs.existsSync(ENV_PATH)) {
        console.log('.env file already exists for development...');
        
        // Ask if they want to load existing variables or delete some
        const choice = await confirm({
            message: 'Would you like to load all existing .env variables or selectively delete some? { n -> load all, y -> select }',
            default: false,
            required: true,
        });

        if (choice) {
            const envContent = dotenv.parse(fs.readFileSync(ENV_PATH, 'utf8'));
            const keys = Object.keys(envContent);

            // Let user choose variables to delete
            const variablesToDelete = await checkbox({
                message: '\nSelect variables to delete (those selected will be removed):\n',
                choices: keys.map(key => ({ name: key, value: key })),
            });

            // Filter out selected variables to delete and rewrite .env
            const updatedEnvContent = keys
                .filter(key => !variablesToDelete.includes(key))
                .map(key => `${key}=${envContent[key]}`)
                .join('\n');

            fs.writeFileSync(ENV_PATH, updatedEnvContent);
            console.log('Selected variables have been deleted from the .env file.');
        } else {
            console.log('Adding .env to noed');
        }
    } else {
        console.log('.env file will be loaded from noed...');
    }

    // Prompt for new APP_ID and TOKEN regardless
    const appId = await input({ message: 'Enter your Noed Application ID', required: true });
    const token = await input({ message: 'Enter the Application Token', required: true });
    const newEnvContent = `APP_ID=${appId}\nTOKEN=${token}`;

    // Append new environment variables to the .env file
    fs.appendFileSync(ENV_PATH, `\n${newEnvContent}`);
    console.log('.env file updated with new production variables.');
}

module.exports = { init };