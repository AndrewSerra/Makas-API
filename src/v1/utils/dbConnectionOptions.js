// This is the limit the pool size and server being down
// due to sockets being all occupied
module.exports = {
    poolSize: 10, 
    socketTimeoutMS: 10000,
    useNewUrlParser: true,
    useUnifiedTopology: true
}