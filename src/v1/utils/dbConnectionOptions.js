// This is the limit the pool size and server being down
// due to sockets being all occupied
module.exports = {
    poolSize: 10, 
    bufferMaxEntries: 0,
    connectTimeoutMS: 5000,
    socketTimeoutMS: 3000, 
    useNewUrlParser: true,
    useUnifiedTopology: true
}