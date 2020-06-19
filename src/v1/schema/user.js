// This is the validator schema for the User model

module.exports = {
    bsonType: "object",
    required: ["name", "contact","password"],
    properties: {
        name:{
            bsonType: "string",
            minLength: 5,
            description: "This is a string and it is required.",
        },
        contact:{
            bsonType: "object",
            required: ["email", "phone"],
            properties:{
                email:{
                    bsonType: "object",
                    required: ["email_address", "verified"],
                    properties: {
                        email_address:{
                            bsonType: "string",
                            description: "Email is checked by regex",
                            pattern: "^\w+([.-]?\w+)*@\w+([.-]?\w+)*(.\w{2,3})+$"
                        },
                        verified:{
                            bsonType: "bool",
                            description: "Boolean value: true if the email_address is owned by the user and it is verified else false",

                        }
                    }
                },
                phone:{
                    bsonType: "object",
                    required: ["phone_number", "verified"],
                    properties: {
                        phone_number:{
                            bsonType: "string",
                            description: "Cell phone number is checked by regex",
                            pattern: "^\w+([.-]?\w+)*@\w+([.-]?\w+)*(.\w{2,3})+$"
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
        appointments:{
            bsonType: "object",
            required: ["past_appointments", "future_appointments"],
            properties: {
                past_appointments:{
                    bsonType: "array",
                    uniqueItems: true,
                    items: {
                        bsonType: "string",
                        description: "This array has a collection of appointmentIDs that is in the appointment collection."
                    }

                },
                future_appointments:{
                    bsonType: "object",
                    required: ["set", "pending"],
                    properties:{
                        set:{
                            bsonType: "array",
                            uniqueItems: true,
                            items: {
                                bsonType: "string",
                                description: "This array has a collection of appointmentIDs that is in appointment collection which set for future and accepted by the business owner."
                            }
                        },
                        pending:{
                            bsonType: "array",
                            uniqueItems: true,
                            items: {
                                bsonType: "string",
                                description: "This array has a collection of appointmentIDs that is in appointment collection which set for future and pending a response from the business owner."
                            }
                        }
                    }

                }
            }
        },
        favorites:{
            bsonType: "array",
            uniqueItems: true,
            items: {
                bsonType: "string",
                description: "This array has a collection of businessIDs that is in businesses collection that was added as favorite business in the client side"
            }
        }
    }
};
