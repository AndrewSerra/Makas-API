const Ajv = require('ajv');
const ajv = Ajv({allErrors: true, removeAdditional:'all'});

function errorResponse(schemaErrors){
    const errors = schemaErrors.map((error) => {
        return {
            path: error.dataPath,
            message: error.message,
        }
    });
    return {
        status: 'failed',
        errors: errors
    }
}

const validateSchema = (schemaName) => {
    return (req, res, next) => {
        const valid = ajv.validate(schemaName, req.body);
        if (!valid) {
            return res.send(errorResponse(ajv.errors))
        }
        next()
    }
};

const addSchema = (schema,schemaName) => {
    ajv.addSchema(schema,schemaName)
}

module.exports = {validateSchema,addSchema};


