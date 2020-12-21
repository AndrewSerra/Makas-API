// This is the validator schema for the Employee model

module.exports = {
    bsonType: "object",
    required: [
        "name", 
        "business",
        "appointments",
        "rating",
        "services",
        "shifts"
    ],
    properties: {
        name: {
            bsonType: "string",
            description: "This is a string and it is required."
        },
        business: {
            bsonType: "objectId",
            description: "This is a string for businessID and it is required."
        },
        appointments: {
            bsonType: "array",
            uniqueItems: true,
            items: {
                bsonType: "objectId",
                description: "The pending appointment docs in an array as objectIds."
            }
        },
        description: {
            bsonType: "string",
            description: "This is a string for the description for the employee and it is not required."
        },
        image_path: {
            bsonType: "string",
            description: "This is a string of image link and it is not required."
        },
        services: {
            bsonType: "array",
            uniqueItems: true,
            items: {
                bsonType: "objectId",
                description: "This array has a collection of serviceIDs"
            }
        },
        shifts: {
            bsonType: "array",
            uniqueItems: true,
            items: {
                bsonType: "string",
                enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
            }
        }
    }
};
