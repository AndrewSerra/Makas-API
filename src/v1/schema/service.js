const category_service_obj = require('../settings/service');

// Format the name property enum
let names_enum = [];
for(let name_list of Object.values(category_service_obj)) {
	names_enum.push(...name_list)
}

// This is the validator schema for the Service model
module.exports = {
    bsonType: "object",
    required: [
        "name", 
        "business",
        "price",
        "category"
    ],
    properties: {
        name: {
            enum: names_enum,
            description: "This is a string and it is required.",
        },
        business: {
            bsonType: "objectId",
        },
        price: {
            bsonType: "int",
            description: "This is a string and it is required.",
        },
        category: {
            enum: Object.keys(category_service_obj),
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
