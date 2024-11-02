const secrets = require('./index');

// this is just for testing purposes
secrets('prod').then(secs => {
    secs.create('ahadi', 123);
    console.log(secs.get('ahadi'))
}).catch(error => console.log(error));
