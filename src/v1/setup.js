const MongoClient = require('mongodb').MongoClient;
const options = require('./utils/dbConnectionOptions');
const dotenv = require('dotenv').config();
const collection_names = Object.values(require('./settings/collection_names'));


// Check if collections in your database are already created
// Create new collection if it does not appear
async function check_setup(db_name) {

    const client = await MongoClient.connect(process.env.MONGO_URI, options);
    const db = client.db(db_name);
    const items = await db.listCollections().toArray();

    let db_collections = items.map(item => item.name);
    
    // Iterate through the collection names
    // that are supposed to be created
    for(name of Object.values(collection_names)) {
        // If the name is not found as collection 
        // in the database create it.
        if(!db_collections.includes(name)) {
            // Get the schema with the name of missing collection
            try {
                const schema = require(`./schema/${name}`);
                let response;
                if(name === collection_names.USER) {
                    response = await db.createCollection(name, {
                        validator: {
                            $or: [
                                { "contact.email.address": {$regex: /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/} },
                                { "contact.phone.number": {$regex: /^(?:(\+\d+)(?: |-))?\(?(\d{3})\)?(?: |-)(\d{3})(?: |-)(\d{4})/} },
                            ],
                            $jsonSchema: schema
                        }
                    });
                }
                else {
                    response = await db.createCollection(name, {
                        validator: {
                            $jsonSchema: schema
                        }
                    });
                }
                
                console.log(response);
                if(name === collection_names.BUSINESS) {
                    create_index(db, name, 'location',  '2dsphere')
                }
                if(name === collection_names.SERVICE) {
                    create_index(db, name, 'business', 'id');
                }

            } catch (error) {
                console.log("Check the names in the array collection_names, and the schema file names. They have to match.");
                console.log(`Error: ${error.message}. Could not create collection for "${name}"`);
                break;
            }
        }
    }
    console.log('MongoDB connection test successful...');
    client.close();
}

function create_index(db, collection_name, field, index_name) {
    // Get the collection
    const collection = db.collection(collection_name);
    // Create the index
    collection.createIndex({ [field] : index_name }, function(err, result) {
        if(err) throw err;
        console.log(result, "index created.");
    });
}

module.exports = check_setup;