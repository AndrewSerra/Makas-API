// This is the validator schema for the Appointments model

module.exports = {
    bsonType: "object",
    required: [
        "user",
        "business",
        "status"
    ],
    properties: {
        user: {
            bsonType: "objectId",
            description: "This is a string for userID and it is required.",
        },
        business: { bsonType:"objectId", },
        employees: {
            bsonType: "array",
            uniqueItems: true,
            items: {
                bsonType: "objectId",
                description: "This is a collection of employeeIDs and it is required.",
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
                bsonType: "objectId",
                description: "This is a collection of serviceIDs and it is required.",
            }
        },
        status:{ enum: ["Pending", "Complete"], },
    }
};
