// This is the validator schema for the Appointments model
module.exports = {
    bsonType: "object",
    required: [
        "user",
        "business",
        "employees",
        "time",
        "services",
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
        status:{ enum: ["pending", "accepted", "cancelled", "complete"], },
    }
};
