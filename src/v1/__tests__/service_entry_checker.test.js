const checkers = require('../utils/entry_checker');

describe('Test for service_entry_checker function', () => {
    it('should check if the object is valid with full values', () => {
        const obj = {
            name: "Manikur",
            business: "5eee117771931b0b5646412a",
            price: 10,
            category: "Tirnak",
            description: "Garip isler toplulugu",
            rating: 0,
        }

        expect(checkers.service_entry_checker(obj).valid).toBe(true);
    })
})

describe('Test for service_entry_checker function', () => {
    it('should check if the object is valid with missing non-required values', () => {
        const obj = {
            name: "Manikur",
            business: "5eee117771931b0b5646412a",
            price: 10,
            category: "Tirnak",
        }

        expect(checkers.service_entry_checker(obj).valid).toBe(true);
    })
})

describe('Test for service_entry_checker function', () => {
    it('should check if invalid name is found', () => {
        const obj = {
            name: "Pedis",  // Intentionally wrong field
            business: "5eee117771931b0b5646412a",
            price: 10,
            category: "Tirnak",
            description: "Garip isler toplulugu",
            rating: 0,
        }

        expect(checkers.service_entry_checker(obj).valid).toBe(false);
    })
})

describe('Test for service_entry_checker function', () => {
    it('hould check if invalid category is found', () => {
        const obj = {
            name: "Manikur",
            business: "5eee117771931b0b5646412a",
            price: 10,
            category: "Cilt Bakimi",
            description: "Garip isler toplulugu",
            rating: 0,
        }

        expect(checkers.service_entry_checker(obj).valid).toBe(false);
    })
})

describe('Test for service_entry_checker function', () => {
    it('should check if there are missing required fields', () => {
        const obj = {
            business: "5eee117771931b0b5646412a",
            price: 10,
            category: "Tirnak",
            description: "Garip isler toplulugu",
            rating: 0,
        }

        expect(checkers.service_entry_checker(obj).valid).toBe(false);
    })
})

describe('Test for service_entry_checker function', () => {
    it('should check if empty strings are found in required field', () => {
        const obj = {
            name: "Manikur",
            business: "",
            price: 10,
            category: "Tirnak",
            description: "Garip isler toplulugu",
            rating: 0,
        }

        expect(checkers.service_entry_checker(obj).valid).toBe(false);
    })
})

describe('Test for service_entry_checker function', () => {
    it('should check if empty strings are found in non-required field but valid', () => {
        const obj = {
            name: "Manikur",
            business: "5eee117771931b0b5646412a",
            price: 10,
            category: "Tirnak",
            description: "",
            rating: 0,
        }

        expect(checkers.service_entry_checker(obj).valid).toBe(true);
    })
})

describe('Test for service_entry_checker function', () => {
    it('should check if null values are found in required', () => {
        const obj = {
            name: null,
            business: "5eee117771931b0b5646412a",
            price: 10,
            category: "Tirnak",
            description: "Garip isler toplulugu",
            rating: 0,
        }

        expect(checkers.service_entry_checker(obj).valid).toBe(false);
    })
})

describe('Test for service_entry_checker function', () => {
    it('should check if undefined values are found', () => {
        const obj = {
            name: "Manikur",
            business: "5eee117771931b0b5646412a",
            price: undefined,
            category: "Tirnak",
            description: "Garip isler toplulugu",
            rating: 0,
        }

        expect(checkers.service_entry_checker(obj).valid).toBe(false);
    })
})
