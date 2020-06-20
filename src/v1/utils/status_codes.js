module.exports = {
    SUCCESS: 200,       // Successful operation
    NOT_FOUND: 301,     // Document not found
    ERROR: 500,         // Any kind of error occuring on the server
    BAD_REQUEST: 400,   // Missing data, wrong format in data (client errors)
    CONFLICT: 409,      // Use it when a doc is present  but sent it with a message because 
                        // it can have other meanings
}