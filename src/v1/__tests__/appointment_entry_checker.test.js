const checkers = require('../utils/entry_checker');

describe('Test for appointment_entry_checker function', () => {
    it('should check if the object is valid with full values', () => {
        const obj = {
            user: "5ef62b4cdc3aa9aa96b6abf0",
            business: "5eee124471931b0b5646412b",
            employees: [
                "5ef22e9e1d44336413184549",
                "5ef22f411d4433641318454a"
            ],
            time: {
                date: new Date(),
                start: {
                    hour: 12,
                    minute: 30,
                },
                duration: 120,
            },
            services: [
                "5ef475661677f985da8efcf3",
                "5ef475841677f985da8efcf4",
                "5ef475a31677f985da8efcf5"
            ],
            status: "Pending"
        }

        expect(checkers.appointment_entry_checker(obj).valid).toBe(true);
    })
})

describe('Test for appointment_entry_checker function', () => {
    it('should check if there are missing required values', () => {
        const obj = {
            user: "5ef62b4cdc3aa9aa96b6abf0",
            business: "5eee124471931b0b5646412b",
            employees: [
                "5ef22e9e1d44336413184549",
                "5ef22f411d4433641318454a"
            ],
            services: [
                "5ef475661677f985da8efcf3",
                "5ef475841677f985da8efcf4",
                "5ef475a31677f985da8efcf5"
            ],
            status: "Pending"
        }

        expect(checkers.appointment_entry_checker(obj).valid).toBe(false);
    })
})

describe('Test for appointment_entry_checker function', () => {
    it('should check if empty strings are found', () => {
        const obj = {
            user: "",
            business: "5eee124471931b0b5646412b",
            employees: [
                "5ef22e9e1d44336413184549",
                "5ef22f411d4433641318454a"
            ],
            time: {
                date: new Date(),
                start: {
                    hour: 12,
                    minute: 30,
                },
                duration: 120,
            },
            services: [
                "5ef475661677f985da8efcf3",
                "5ef475841677f985da8efcf4",
                "5ef475a31677f985da8efcf5"
            ],
            status: "Pending"
        }

        expect(checkers.appointment_entry_checker(obj).valid).toBe(false);
    })
})

describe('Test for appointment_entry_checker function', () => {
    it('should check if null values are found', () => {
        const obj = {
            user: "5ef62b4cdc3aa9aa96b6abf0",
            business: null,
            employees: [
                "5ef22e9e1d44336413184549",
                "5ef22f411d4433641318454a"
            ],
            time: {
                date: new Date(),
                start: {
                    hour: 12,
                    minute: 30,
                },
                duration: 120,
            },
            services: [
                "5ef475661677f985da8efcf3",
                "5ef475841677f985da8efcf4",
                "5ef475a31677f985da8efcf5"
            ],
            status: "Pending"
        }

        expect(checkers.appointment_entry_checker(obj).valid).toBe(false);
    })
})

describe('Test for appointment_entry_checker function', () => {
    it('should check if null values are found inside objects of doc', () => {
        const obj = {
            user: "5ef62b4cdc3aa9aa96b6abf0",
            business: "5eee124471931b0b5646412b",
            employees: [
                "5ef22e9e1d44336413184549",
                "5ef22f411d4433641318454a"
            ],
            time: {
                date: null,
                start: {
                    hour: 12,
                    minute: 30,
                },
                duration: 120,
            },
            services: [
                "5ef475661677f985da8efcf3",
                "5ef475841677f985da8efcf4",
                "5ef475a31677f985da8efcf5"
            ],
            status: "Pending"
        }

        expect(checkers.appointment_entry_checker(obj).valid).toBe(false);
    })
})

describe('Test for appointment_entry_checker function', () => {
    it('should check if undefined values are found inside objects of doc', () => {
        const obj = {
            user: "5ef62b4cdc3aa9aa96b6abf0",
            business: "5eee124471931b0b5646412b",
            employees: [
                "5ef22e9e1d44336413184549",
                "5ef22f411d4433641318454a"
            ],
            time: {
                date: new Date(),
                start: {
                    hour: 12,
                    minute: 30,
                },
                duration: undefined,
            },
            services: [
                "5ef475661677f985da8efcf3",
                "5ef475841677f985da8efcf4",
                "5ef475a31677f985da8efcf5"
            ],
            status: "Pending"
        }

        expect(checkers.appointment_entry_checker(obj).valid).toBe(false);
    })
})

describe('Test for appointment_entry_checker function', () => {
    it('should check if undefined values are found', () => {
        const obj = {
            user: "5ef62b4cdc3aa9aa96b6abf0",
            business: undefined,
            employees: [
                "5ef22e9e1d44336413184549",
                "5ef22f411d4433641318454a"
            ],
            time: {
                date: new Date(),
                start: {
                    hour: 12,
                    minute: 30,
                },
                duration: 120,
            },
            services: [
                "5ef475661677f985da8efcf3",
                "5ef475841677f985da8efcf4",
                "5ef475a31677f985da8efcf5"
            ],
            status: "Pending"
        }

        expect(checkers.appointment_entry_checker(obj).valid).toBe(false);
    })
})