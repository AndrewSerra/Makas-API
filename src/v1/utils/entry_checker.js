const reasons = {
    MISSING_REQUIRED_FIELD: "Required field is missing.",
    CONTAINS_UNDEF: "Fields must have valid inputs.",
}

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
        geo_loc: 1,
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

module.exports = {
    reasons,
    business_entry_checker,    
}