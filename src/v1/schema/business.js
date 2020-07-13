// This is the validator schema for the Business model
// It should be used as the $jsonSchema in validation


/* pls add:
-services that business can provide for customers
-employees object,
-working hours
*/

module.exports = {
    bsonType: "object",
    required: [
        "name", 
        "address", 
        "location", 
        "contact",
        "password",
        "created"
    ],
    properties: {
        name: {
            bsonType: "string",
            description: "This is a string and it is required."
        },
        address: {
            bsonType: "object",
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
                    description: "The country should be a string and it is required"
                }
            }
        },
        location: {
            bsonType: "object",
            properties: {
                type: { bsonType: "string" },
                coordinates: { 
                    bsonType: "array",
                    items: { bsonType: "double" } 
                }
            }
        },
        contact: {
            bsonType: "object",
            properties: {
                phone: {
                    bsonType: "string",
                    description: "Cell phone number is checked by regex",
                    // pattern: "^\d-\d-\d$"
                },
                email: {
                    bsonType: "string",
                    description: "Cell phone number is checked by regex",
                    // pattern: "^\w+([.-]?\w+)*@\w+([.-]?\w+)*(.\w{2,3})+$"
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
        gender: {
            enum: ["male", "female", "both"],
            description: "Choose which customer gender you work with.",
        },
        created: {
            bsonType: "date",
            description: "Date that the business created the account."
        }
    }
}
