// Check if collections in your database are already created
// Create new collection if it does not appear

function check_setup(db) {
    const collection_names = [
        "business",
        "users"
    ]
    
    db.listCollections().toArray(function(err, items) {
        if(err) throw err;
        console.log(items);
    });
}

module.exports = check_setup;