const checkers = require('../utils/entry_checker');

describe('Test for employee_entry_checker function', () => {
    it('should check if the object is valid with full values', () => {
        const obj = {
            name: "Andrew Serra",
            business: "5ef2299f5cb48d61ee4cae3b",
            appointments: [{something: "yes"}, {something: "no"}],
            description: "Describing Andrew Serra",
            rating: [{something: "yes"}],
            image_path: "/images/something.jpg",
            services: [{something: "yes"}],
            shifts: [{something: "yes"}]
        }

        expect(checkers.employee_entry_checker(obj).valid).toBe(true);
    })
})

describe('Test for employee_entry_checker function', () => {
    it('should check if the object is valid with full values with empty arrays', () => {
        const obj = {
            name: "Andrew Serra",
            business: "5ef2299f5cb48d61ee4cae3b",
            appointments: [],
            description: "Describing Andrew Serra",
            rating: [],
            image_path: "/images/something.jpg",
            services: [],
            shifts: []
        }

        expect(checkers.employee_entry_checker(obj).valid).toBe(true);
    })
})

describe('Test for employee_entry_checker function', () => {
    it('should check if the object is valid with full values, but not all values', () => {
        const obj = {
            name: "Andrew Serra",
            business: "5ef2299f5cb48d61ee4cae3b",
            image_path: "",
            services: [],
            shifts: []
        }

        expect(checkers.employee_entry_checker(obj).valid).toBe(true);
    })
})

describe('Test for employee_entry_checker function', () => {
    it('should check if there are missing required values', () => {
        const obj = {
            business: "5ef2299f5cb48d61ee4cae3b",
            appointments: [],
            description: "",
            rating: [],
            image_path: "",
            services: [],
            shifts: []
        }

        expect(checkers.employee_entry_checker(obj).valid).toBe(false);
    })
})

describe('Test for employee_entry_checker function', () => {
    it('should check if empty strings are found in required field', () => {
        const obj = {
            name: "",
            business: "5ef2299f5cb48d61ee4cae3b",
            appointments: [],
            description: "",
            rating: [],
            image_path: "",
            services: [],
            shifts: []
        }

        expect(checkers.employee_entry_checker(obj).valid).toBe(false);
    })
})

describe('Test for employee_entry_checker function', () => {
    it('should check if empty strings are found in non-required field and valid', () => {
        const obj = {
            name: "Andrew Serra",
            business: "5ef2299f5cb48d61ee4cae3b",
            appointments: [],
            description: "",
            rating: [],
            image_path: "",
            services: [],
            shifts: []
        }

        expect(checkers.employee_entry_checker(obj).valid).toBe(true);
    })
})

describe('Test for employee_entry_checker function', () => {
    it('should check if null values are found in required', () => {
        const obj = {
            name: null,
            business: "5ef2299f5cb48d61ee4cae3b",
            appointments: [],
            description: "",
            rating: [],
            image_path: "",
            services: [],
            shifts: []
        }

        expect(checkers.employee_entry_checker(obj).valid).toBe(false);
    })
})

describe('Test for employee_entry_checker function', () => {
    it('should check if undefined values are found', () => {
        const obj = {
            name: "Andrew Serra",
            business: undefined,
            appointments: [],
            description: "",
            rating: [],
            image_path: "",
            services: [],
            shifts: []
        }

        expect(checkers.employee_entry_checker(obj).valid).toBe(false);
    })
})
