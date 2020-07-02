// This is the validator schema for the Rating model

module.exports = {
    bsonType: 'object',
    required: [
        'business',
        'rating',
    ],
    properties: {
        business: { bsonType: 'objectId' },
        rating: {
            bsonType: 'array',
            items: { 
                bsonType: 'double',  
                minimum: 0,
                maximum: 5
            }
        },
    }
}