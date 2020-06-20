
// Check if collections in your database are already created
// Create new collection if it does not appear

function check_setup(db) {
    const collection_names = [
        "user",
        "business"
    ]

    db.listCollections().toArray(function(err, items) {
        if(err) throw err;

        db_collections = items.map(item => item.name);

        // Iterate through the collection names
        // that are supposed to be created
        for(name of collection_names) {
            // If the name is not found as collection
            // in the database create it.
            if(!db_collections.includes(name)) {
                // Get the schema with the name of missing collection
                try {
                    const schema = require(`./schema/${name}`);

                    db.createCollection(name, {
                        validator: {
                            $jsonSchema: schema
                        }
                    })
                } catch (error) {
                    console.log("Check the names in the array collection_names, and the schema file names. They have to match.");
                    console.log(`Error: ${error.message}. Could not create collection for "${name}"`);
                    break;
                }
            }
        }
    });
}

module.exports = check_setup;
