// This is the validator schema for the Employee model

module.exports = {
    bsonType: "object",
    required: ["name", "business"],
    properties:{
        name:{
            bsonType: "string",
            description: "This is a string and it is required."
        },
        business:{
            bsonType: "string",
            description: "This is a string for businessID and it is required."
        },
        calendar:{
            // TO DO
        },
        description:{
            bsonType: "string",
            description: "This is a string for the description for the employee and it is not required."
        },
        rating:{
            bsonType: "array",
            uniqueItems: true,
            items: {
                bsonType: "objectId",
                description: "The rating of any service provided by the business from ratings model."
            }
        },
        image_path:{
            bsonType: "string",
            description: "This is a string of image link and it is not required."
        },
        services:{
            bsonType: "array",
            uniqueItems: true,
            items: {
                bsonType: "string",
                description: "This array has a collection of serviceIDs"
            }
        },
        shift:{
            // TO DO
            // Hours worked for days in a week
        }
    }
};
