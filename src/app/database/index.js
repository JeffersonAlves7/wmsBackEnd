const config = require('../config/project.json');

async function connect({ username, password, ip, port, schema }) {
    if (username && password && ip && port && schema) {
        const mysql = require('mysql2/promise');
        const connection = await mysql.createConnection(`mysql://${username}:${password}@${ip}:${port}/${schema}`);
        return connection;
    } else {
        throw new Error('Invalid request for connect function')
    }
}

async function stablishConnection() {
    const connection = await connect(config.database)
    return connection
}


module.exports = stablishConnection