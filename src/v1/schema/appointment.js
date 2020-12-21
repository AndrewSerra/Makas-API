// This is the validator schema for the Appointments model
module.exports = {
    bsonType: "object",
    required: [
        "user",
        "business",
        "employees",
        "time",
        "services",
        "rating",
        "status",
    ],
    properties: {
        user: {
            bsonType: "objectId",
            description: "This is a string for userID and it is required.",
        },
        business: { bsonType:"objectId" },
        employees: {
            bsonType: "array",
            uniqueItems: true,
            items: {
                bsonType: "objectId",
                description: "This is a collection of employeeIDs and it is required.",
            }
        },
        time: {
            bsonType: "object",
            properties: {
                start: { bsonType: 'date' },
                end: { bsonType: "date"},
                duration: {
                    bsonType: "int",
                    description: "Duration in minutes."
                }
            }
        },
        services:{
            bsonType: "array",
            uniqueItems: true,
            items: {
                bsonType: "objectId",
                description: "This is a collection of serviceIDs and it is required.",
            }
        },
        rating:{
            bsonType: "array",
            items: {
                bsonType: "double",
                description: "if it is -1 than the rating is not given yet, if it is a bool between 0-5 than"
            }
        },
        status:{ enum: ["pending", "accepted", "cancelled", "complete"], },
    }
};
