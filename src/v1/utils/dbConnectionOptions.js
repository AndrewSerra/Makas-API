// This is the limit the pool size and server being down
// due to sockets being all occupied
module.exports = {
    poolSize: 10, 
    bufferMaxEntries: 0,
    reconnectTries: 1000,
    connectTimeoutMS: 1000,
    socketTimeoutMS: 300, 
    useNewUrlParser: true,
    useUnifiedTopology: true
}