// This is the validator schema for the Rating model

module.exports = {
    bsonType: 'object',
    required: [
        'business',
        'rating',
    ],
    properties: {
        business: { bsonType: 'objectId' },
        services:{
            bsonType: "array",
            uniqueItems: true,
            items: {
                bsonType: "objectId",
                description: "This is a collection of serviceIDs and it is required.",
            }
        },
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