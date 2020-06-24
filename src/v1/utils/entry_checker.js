const reasons = {
    MISSING_REQUIRED_FIELD: "Required field is missing.",
    CONTAINS_UNDEF: "Fields must have valid inputs.",
    NON_ENUM_VAL_FOUND: "Values must be from the enum defined."
}
const category_service_obj = require('../settings/service');

// Returns an object with the reason
function business_entry_checker(business) {

    let includes_undef = false;
    let reason = null;

    // If not type of object throw an error
    if(!(business instanceof Object)) {
        throw new Error(`Business object has invalid type: ${typeof(business)}`);
    }

    let required_keys = {
        name: 1,
        address: 1,
        location: 1,
        contact: 1,
        description: 1,
        password: 1,
        created: 1,
    }

    for(let[key, value] of Object.entries(business)) {
        // Change the flags when a required key is encountered
        if(Object.keys(required_keys).includes(key)) {
            required_keys[key] = 0;
        }
        if(value instanceof Object) {
            for(let [_, sub_value] of Object.entries(value)) {
                // Value check for being null, undefined or empty string
                if(sub_value === null || sub_value === "" || sub_value === undefined) {
                    includes_undef = true;
                    reason = reasons.CONTAINS_UNDEF;
                }
            }
        }
        else {
            // Value check for being null, undefined or empty string
            if(value === null || value === "" || value === undefined) {
                includes_undef = true;
                reason = reasons.CONTAINS_UNDEF;
            }
        }
    }
    // Check if the required values are met
    let is_missing_fields = Object.values(required_keys).some(e => e === 1);
    reason = is_missing_fields ? reasons.MISSING_REQUIRED_FIELD : reason;

    return {
        valid: (!includes_undef && !is_missing_fields),
        reason: reason,
    }
}

// Returns an object with the reason
function employee_entry_checker(employee) {

    let includes_undef = false;
    let reason = null;

    // If not type of object throw an error
    if(!(employee instanceof Object)) {
        throw new Error(`Employee object has invalid type: ${typeof(employee)}`);
    }

    let required_keys = {
        name: 1,
        business: 1,
    }

    for(let[key, value] of Object.entries(employee)) {
        // Change the flags when a required key is encountered
        if(Object.keys(required_keys).includes(key)) {
            required_keys[key] = 0;
        }
        
        // Value check for being null, undefined or empty string
        if(value === null || 
            (value === "" && Object.keys(required_keys).includes(key)) || 
            value === undefined) {

            includes_undef = true;
            reason = reasons.CONTAINS_UNDEF;
        }
    }
    // Check if the required values are met
    let is_missing_fields = Object.values(required_keys).some(e => e === 1);
    reason = is_missing_fields ? reasons.MISSING_REQUIRED_FIELD : reason;

    return {
        valid: (!includes_undef && !is_missing_fields),
        reason: reason,
    }
}

function service_entry_checker(service) {
    let includes_undef = false;
    let reason = null;

    // If not type of object throw an error
    if(!(service instanceof Object)) {
        throw new Error(`Service object has invalid type: ${typeof(service)}`);
    }

    let required_keys = {
        name: 1,
        business: 1,
        price: 1,
        category: 1,
    }

    for(let[key, value] of Object.entries(service)) {
        // Change the flags when a required key is encountered
        if(Object.keys(required_keys).includes(key)) {
            required_keys[key] = 0;
        }
        if(key === "category" && !Object.keys(category_service_obj).includes(value)) {
            // Return immediately because name field will not be able to get the valid key
            // in category_service_obj and fail due to the .includes() 
            return {
                valid: false,
                reason: reasons.NON_ENUM_VAL_FOUND,
            }
        }
        else if(key === "name" && Object.keys(category_service_obj).includes(service.category)) {
            // Two step check because the the key value pair order that is received
            // is unknown. It can cause problems if name is checked before category
            if(!category_service_obj[service.category].includes(value)) {
                includes_undef = true;
                reason = reasons.NON_ENUM_VAL_FOUND;
            }
        }
        
        // Value check for being null, undefined or empty string
        if(value === null || 
            (value === "" && Object.keys(required_keys).includes(key)) || value === undefined) {

            includes_undef = true;
            reason = reasons.CONTAINS_UNDEF;
        }
    }
    // Check if the required values are met
    let is_missing_fields = Object.values(required_keys).some(e => e === 1);
    reason = is_missing_fields ? reasons.MISSING_REQUIRED_FIELD : reason;

    return {
        valid: (!includes_undef && !is_missing_fields),
        reason: reason,
    }
}

module.exports = {
    reasons,
    business_entry_checker,
    employee_entry_checker,
    service_entry_checker,
}