// This is the validator schema for the Appointments model

module.exports = {
    bsonType: "object",
    required: ["user","business"],//,"employee","time", "service", "status"
    properties: {
        user:{
            bsonType: "string",
            description: "This is a string for userID and it is required.",
        },
        business: {
            bsonType:"object",
            required: ["businessID", "rating"],
            properties:{
                businessID:{
                    bsonType: "string",
                    description: "This is a string for businessID and it is required.",
                },
                rating:{
                    bsonType: "string",
                    description: "This is a string for rating and it is not required.",
                }
            }

        },
        employee:{
            bsonType:"object",
            required: ["employeeID", "rating"],
            properties:{
                employeeID:{
                    bsonType: "string",
                    description: "This is a string for employeeID and it is required.",
                },
                rating:{
                    bsonType: "string",
                    description: "This is a string for rating and it is not required.",
                }
            }

        },
        time:{
            bsonType: "timestamp",
            description: "This is a time object for the time interval recorded for reservation and it is required.",
        },
        service:{
            bsonType: "array",
            uniqueItems: true,
            items: {
                bsonType: "string",
                description: "This is a collection of serviceIDs and it is required.",
            }

        },
        status:{
            enum: ["set", "pending"],
            description: "Choose which customer gender you work with."
        },

    }
};
