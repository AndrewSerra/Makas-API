// This is the validator schema for the Business model
// It should be used as the $jsonSchema in validation
module.exports = {
    bsonType: "object",
    required: ["name", "address", "geo_loc"],
    properties: {
        name: {
            bsonType: "string",
            description: "This is a string and it is required."
        },
        address: {
            bsonType: "object",
            required: ["street", "city", "country"],
            properties: {
                street: {
                    bsonType: "string",
                    description: "The street should be a string and it is required"
                },
                city: {
                    bsonType: "string",
                    description: "The city should be a string and it is required"
                },
                country: {
                    bsonType: "string",
                    description: "The city should be a string and it is required"
                }
            }
        },
        geo_loc: {
            bsonType: "object",
            required: ["lat", "lon"],
            properties: {
                lat: { bsonType: "float" },
                lon: { bsonType: "float" }
            }
        },
        contact: {
            bsonType: "object",
            required: ["email"],
            properties: {
                phone: {
                    bsonType: "string",
                    description: "Cell phone number is checked by regex",
                    pattern: "^\d-\d-\d$"
                },
                email: {
                    bsonType: "string",
                    description: "Cell phone number is checked by regex",
                    pattern: "^\w+([.-]?\w+)*@\w+([.-]?\w+)*(.\w{2,3})+$"
                }
            }
        },
        description: { 
            bsonType: "string",
            description: "The description is a short explanation about the business, not required"
        },
        image_paths: {
            bsonType: "array",
            uniqueItems: true,
            items: {
                bsonType: "string",
                description: "This array has a collection of image paths that is in the express droplet."
            }
        },
        password: {
            bsonType: "string",
            description: "business login password",
        },
        ratings: {
            bsonType: "array",
            uniqueItems: true,
            items: {
                bsonType: "objectId",
                description: "The rating of any service provided by the business from ratings model."
            }
        },
        gender: {
            enum: ["male", "female", "both"],
            description: "Choose which customer gender you work with."
        }
    }
}