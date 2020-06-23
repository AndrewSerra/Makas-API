const {service_categories, service_names} = require('../settings/service');

// This is the validator schema for the Service model
module.exports = {
    bsonType: "object",
    required: [
        "name", 
        "price",
        "category"
    ],
    properties: {
        business: {
            bsonType: "objectId",
        },
        name: {
            enum: service_names,
            description: "This is a string and it is required.",
        },
        price: {
            bsonType: "int",
            description: "This is a string and it is required.",
        },
        category: {
            enum: service_categories,
            description: "This is a string and it is required.",
        },
        description:{
            bsonType: "string",
            description: "The description is a short explanation about the service, not required",
        },
        rating: {
            bsonType: "int",
            minimum: 0,
            maximum: 5,
        }
    }
};
