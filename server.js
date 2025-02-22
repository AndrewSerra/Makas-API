const bodyParser = require('body-parser');
const cors = require('cors');
const compression = require('compression');
const express = require('express');
const dotenv = require('dotenv').config();
const MongoClient = require('mongodb').MongoClient;
const check_setup = require('./src/v1/setup');
const options = require('./src/v1/utils/dbConnectionOptions');
const path = require('path');

// Routers for versions of the API
const routerV1 = require('./src/v1/routes/main');

const app = express();

app.use(compression());
app.use(cors());
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

const PORT = process.env.PORT || 3000;

// It will connect to database dev_test
// Later it will be changed to production when needed
// This is just to test the connection on startup
const dbName = process.env.NODE_ENV === 'production' ? process.env.DB_NAME_PROD : process.env.DB_NAME;
check_setup(dbName);

// Add the routes to the app
app.use('/v1', routerV1);
// app.use('/', express.static(path.join(__dirname, '../makas-dashboard/build')));
// app.get('*', function(req, res) {
//     res.sendFile(path.join(__dirname, '../makas-dashboard/build', 'index.html'))
// })

const server = app.listen(PORT, () => console.log(`Listening on port ${PORT}`)); 

// Graceful shutdown code
// setInterval(() => server.getConnections(
//     (err, connections) => console.log(`${connections} connections currently open`)
// ), 1000);

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

let connections = [];

server.on('connection', connection => {
    connections.push(connection);
    connection.on('close', () => connections = connections.filter(curr => curr !== connection));
});

function shutdown() {
    console.log('Received kill signal, shutting down gracefully');
    server.close(() => {
        console.log('Closed out remaining connections');
        process.exit(0);
    });

    setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 10000);

    connections.forEach(curr => curr.end());
    setTimeout(() => connections.forEach(curr => curr.destroy()), 5000);
}