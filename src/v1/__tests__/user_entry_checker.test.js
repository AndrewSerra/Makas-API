const checkers = require('../utils/entry_checker');

describe('Test for user_entry_checker function', () => {
    it('should check if the object is valid with full values', () => {
        const date = new Date();
        const obj = { 
            name: "Andrew Serra",
            password: "mylittlepony",
            contact: {
                email: {
                    address: "andy@serra.us",
                    verified: false,
                },
                phone: {
                    number: "5309688023",
                    verified: false,
                },
            },
            appointments: [],
            favorites: [],
            created: date,
            last_login: date,
        };

        expect(checkers.user_entry_checker(obj).valid).toBe(true);
    })
})

describe('Test for user_entry_checker function', () => {
    it('should check if the object is valid with optional email and not phone condition', () => {
        const date = new Date();
        const obj = { 
            name: "Andrew Serra",
            password: "mylittlepony",
            contact: {
                email: {
                    address: "andy@serra.us",
                    verified: false,
                },
                phone: {
                    number: "",
                    verified: false,
                },
            },
            appointments: [],
            favorites: [],
            created: date,
            last_login: date,
        };

        expect(checkers.user_entry_checker(obj).valid).toBe(true);
    })
})

describe('Test for user_entry_checker function', () => {
    it('should check if the object is valid with optional not email and phone condition', () => {
        const date = new Date();
        const obj = { 
            name: "Andrew Serra",
            password: "mylittlepony",
            contact: {
                email: {
                    address: "",
                    verified: false,
                },
                phone: {
                    number: "5309688023",
                    verified: false,
                },
            },
            appointments: [],
            favorites: [],
            created: date,
            last_login: date,
        };

        expect(checkers.user_entry_checker(obj).valid).toBe(true);
    })
})

describe('Test for user_entry_checker function', () => {
    it('should check if the object is valid with missing non-required values, full contact info', () => {
        const date = new Date();
        const obj = { 
            name: "Andrew Serra",
            password: "mylittlepony",
            contact: {
                email: {
                    address: "andy@serra.us",
                    verified: false,
                },
                phone: {
                    number: "5309688023",
                    verified: false,
                },
            },
            created: date,
            last_login: date,
        };

        expect(checkers.user_entry_checker(obj).valid).toBe(true);
    })
})

describe('Test for user_entry_checker function', () => {
    it('should check if the object is valid with missing non-required values, only missing phone', () => {
        const date = new Date();
        const obj = { 
            name: "Andrew Serra",
            password: "mylittlepony",
            contact: {
                email: {
                    address: "andy@serra.us",
                    verified: false,
                },
                phone: {
                    number: "",
                    verified: false,
                },
            },
            created: date,
            last_login: date,
        };

        expect(checkers.user_entry_checker(obj).valid).toBe(true);
    })
})

describe('Test for user_entry_checker function', () => {
    it('should check if the object is valid with missing non-required values, only missing email', () => {
        const date = new Date();
        const obj = { 
            name: "Andrew Serra",
            password: "mylittlepony",
            contact: {
                email: {
                    address: "",
                    verified: false,
                },
                phone: {
                    number: "5309688023",
                    verified: false,
                },
            },
            created: date,
            last_login: date,
        };

        expect(checkers.user_entry_checker(obj).valid).toBe(true);
    })
})

describe('Test for user_entry_checker function', () => {
    it('should check if null is found in required property', () => {
        const date = new Date();
        const obj = { 
            name: "Andrew Serra",
            password: null,
            contact: {
                email: {
                    address: "",
                    verified: false,
                },
                phone: {
                    number: "5309688023",
                    verified: false,
                },
            },
            appointments: [],
            favorites: [],
            created: date,
            last_login: date,
        };

        expect(checkers.user_entry_checker(obj).valid).toBe(false);
    })
})

describe('Test for user_entry_checker function', () => {
    it('should check if undefined in required property', () => {
        const date = new Date();
        const obj = { 
            name: undefined,
            password: "mylittlepony",
            contact: {
                email: {
                    address: "andy@serra.us",
                    verified: false,
                },
                phone: {
                    number: "5309688023",
                    verified: false,
                },
            },
            appointments: [],
            favorites: [],
            created: date,
            last_login: date,
        };

        expect(checkers.user_entry_checker(obj).valid).toBe(false);
    })
})

describe('Test for user_entry_checker function', () => {
    it('should check if there are missing required fields', () => {
        const date = new Date();
        const obj = { 
            password: "mylittlepony",
            contact: {
                email: {
                    address: "andy@serra.us",
                    verified: false,
                },
                phone: {
                    number: "5309688023",
                    verified: false,
                },
            },
            appointments: [],
            favorites: [],
            created: date,
            last_login: date,
        };

        expect(checkers.user_entry_checker(obj).valid).toBe(false);
    })
})

describe('Test for user_entry_checker function', () => {
    it('should check if empty strings are found in required field', () => {
        const date = new Date();
        const obj = { 
            name: "",
            password: "mylittlepony",
            contact: {
                email: {
                    address: "andy@serra.us",
                    verified: false,
                },
                phone: {
                    number: "5309688023",
                    verified: false,
                },
            },
            appointments: [],
            favorites: [],
            created: date,
            last_login: date,
        };

        expect(checkers.user_entry_checker(obj).valid).toBe(false);
    })
})

describe('Test for user_entry_checker function', () => {
    it('should check if two empty strings are found in required contact', () => {
        const date = new Date();
        const obj = { 
            name: "Andrew Serra",
            password: "mylittlepony",
            contact: {
                email: {
                    address: "",
                    verified: false,
                },
                phone: {
                    number: "",
                    verified: false,
                },
            },
            appointments: [],
            favorites: [],
            created: date,
            last_login: date,
        };

        expect(checkers.user_entry_checker(obj).valid).toBe(false);
    })
})