const checkers = require('../utils/entry_checker');

describe('Test for business_entry_checker function', () => {
    it('should check if the object is valid with full values', () => {
        const obj = {
            "name": "Kuaför Muzaffer",
            "address": {
                "street": "Mahmutun sokak",
                "city": "Izmir",
                "country": "Estonia"
            },
            "location": {
                "type": "Point",
                "coordinates": ["38.436421", "27.141974"],
            },
            "contact": {
                "email": "ecenaz@kuafor.com",
                "phone":  "05326244444"
            },
            "password": "mylittlesunshine",
            "description": "0 yıllık kuaför tecrübesi",
            "created": new Date()
        }

        expect(checkers.business_entry_checker(obj).valid).toBe(true);
    })
})

describe('Test for business_entry_checker function', () => {
    it('should check if there are missing required values', () => {
        const obj = {
            name: "ahmet kuafor",
            description: "Asklarin aski",
            address: "Kamil sokak",
        }

        expect(checkers.business_entry_checker(obj).valid).toBe(false);
    })
})

describe('Test for business_entry_checker function', () => {
    it('should check if empty strings are found', () => {
        const obj = {
            "name": "",
            "address": {
                "street": "Mahmutun sokak",
                "city": "Izmir",
                "country": "Estonia"
            },
            "location": {
                "type": "Point",
                "coordinates": ["38.436421","27.141974"]
            },
            "contact": {
                "email": "ecenaz@kuafor.com",
                "phone":  "05326244444"
            },
            "password": "mylittlesunshine",
            "description": "0 yıllık kuaför tecrübesi",
            "created": new Date()
        }

        expect(checkers.business_entry_checker(obj).valid).toBe(false);
    })
})

describe('Test for business_entry_checker function', () => {
    it('should check if null values are found', () => {
        const obj = {
            "name": "Kuafor Muzaffer",
            "address": {
                "street": "Mahmutun sokak",
                "city": "Izmir",
                "country": "Estonia"
            },
            "location": {
                "type": "Point",
                "coordinates": ["38.436421","27.141974"]
            },
            "contact": {
                "email": "ecenaz@kuafor.com",
                "phone":  "05326244444"
            },
            "password": null,
            "description": "0 yıllık kuaför tecrübesi",
            "created": new Date()
        }

        expect(checkers.business_entry_checker(obj).valid).toBe(false);
    })
})

describe('Test for business_entry_checker function', () => {
    it('should check if null values are found inside objects of doc', () => {
        const obj = {
            "name": "Kuafor Muzaffer",
            "address": {
                "street": "Mahmutun sokak",
                "city": null,
                "country": "Estonia"
            },
            "location": {
                "type": "Point",
                "coordinates": ["38.436421","27.141974"]
            },
            "contact": {
                "email": "ecenaz@kuafor.com",
                "phone": "05326244444"
            },
            "password": "mylittlesunshine",
            "description": "0 yıllık kuaför tecrübesi",
            "created": new Date()
        }

        expect(checkers.business_entry_checker(obj).valid).toBe(false);
    })
})

describe('Test for business_entry_checker function', () => {
    it('should check if undefined values are found inside objects of doc', () => {
        const obj = {
            "name": "Kuafor Muzaffer",
            "address": {
                "street": "Mahmutun sokak",
                "city": "Izmir",
                "country": "Estonia"
            },
            "location": {
                "type": "Point",
                "coordinates": ["38.436421","27.141974"]
            },
            "contact": {
                "email": undefined,
                "phone": "05326244444"
            },
            "password": "mylittlesunshine",
            "description": "0 yıllık kuaför tecrübesi",
            "created": new Date()
        }

        expect(checkers.business_entry_checker(obj).valid).toBe(false);
    })
})

describe('Test for business_entry_checker function', () => {
    it('should check if undefined values are found', () => {
        const obj = {
            "name": "Kuafor Muzaffer",
            "address": {
                "street": "Mahmutun sokak",
                "city": "Izmir",
                "country": "Estonia"
            },
            "location": {
                "type": "Point",
                "coordinates": ["38.436421","27.141974"]
            },
            "contact": {
                "email": "ecenaz@kuafor.com",
                "phone":  "05326244444"
            },
            "password": "mylittlesunshine",
            "description": undefined,
            "created": new Date()
        }

        expect(checkers.business_entry_checker(obj).valid).toBe(false);
    })
})