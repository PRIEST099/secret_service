const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

const ENV_PATH = '.env';

function get(key) {
    dotenv.config();  // Reload .env in case it has been updated
    return process.env[key] || null;
}

function create(key, value) {
    if (get(key)) {
        console.log(`Key "${key}" already exists. Use update() instead.`);
        return;
    }
    appendToEnvFile(`${key}=${value}`);
    console.log(`Key "${key}" added with value "${value}".`);
}

function update(key, value) {
    if (!get(key)) {
        console.log(`Key "${key}" does not exist. Use create() instead.`);
        return;
    }
    modifyEnvFile(key, value);
    console.log(`Key "${key}" updated with new value "${value}".`);
}

function remove(key) {
    if (!get(key)) {
        console.log(`Key "${key}" does not exist.`);
        return;
    }
    modifyEnvFile(key);
    console.log(`Key "${key}" has been removed.`);
}

// Helper Functions

function appendToEnvFile(content) {
    fs.appendFileSync(ENV_PATH, `\n${content}`);
}

function modifyEnvFile(key, newValue = null) {
    const envConfig = fs.readFileSync(ENV_PATH, 'utf8').split('\n');
    const updatedConfig = envConfig.map(line => {
        if (line.startsWith(`${key}=`)) {
            return newValue ? `${key}=${newValue}` : null;
        }
        return line;
    }).filter(Boolean);  // Remove lines set to null for delete operation

    fs.writeFileSync(ENV_PATH, updatedConfig.join('\n'));
}


module.exports = {
    get, create, update, remove
}