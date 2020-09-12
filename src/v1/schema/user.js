// This is the validator schema for the User model

module.exports = {
    bsonType: "object",
    required: ["name", "password", "created", "last_login"],
    properties: {
        name:{
            bsonType: "string",
            minLength: 3,
            description: "This is a string and it is required.",
        },
        contact:{
            bsonType: "object",
            properties:{
                email:{
                    bsonType: "object",
                    properties: {
                        address:{
                            bsonType: "string",
                            description: "Email is checked by regex"
                        },
                        verified:{
                            bsonType: "bool",
                            description: "Boolean value: true if the email_address is owned by the user and it is verified else false",
                        }
                    }
                },
                phone:{
                    bsonType: "object",
                    properties: {
                        number:{
                            bsonType: "string",
                            description: "Cell phone number is checked by regex",
                        },
                        verified:{
                            bsonType: "bool",
                            description: "Boolean value: true if the phone_number is owned by the user and it is verified else false",

                        }
                    }
                },
            }
        },
        password:{
            bsonType: "string",
            description: "user login password",
        },
        favorites:{
            bsonType: "array",
            uniqueItems: true,
            items: {
                bsonType: "objectId",
                description: "This array has a collection of businessIDs that is in businesses collection that was added as favorite business in the client side"
            }
        },
        verificationCode:{
            bsonType: "array",
            items: {
                bsonType: "int",
                description: "This array has positive integers as items"
            }
        },
        accessToken:{
            bsonType : "string",
            description: "Contains a string that will be used to verify when the app starts and the user needs to stay logged in"
        },
        created: {
            bsonType: 'date',
        },
        last_login: {
            bsonType: 'date'
        }
    }
};
