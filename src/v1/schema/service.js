// This is the validator schema for the Service model

module.exports = {
    bsonType: "object",
    required: ["name", "price","service_category"],
    properties: {
        name:{
            bsonType: "string",
            description: "This is a string and it is required.",
        },
        price: {
            bsonType: "string",
            description: "This is a string and it is required.",
        },
        service_category:{
            bsonType: "string",
            description: "This is a string and it is required.",
        },
        description:{
            bsonType: "string",
            description: "The description is a short explanation about the service, not required",
        },
    }
};
