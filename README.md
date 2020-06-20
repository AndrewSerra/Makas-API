# Setting up MongoDB Compass
- Use this command on local device to see it in compass and enabling express to connect \n
```ssh -L 4321:localhost:27018 root@142.93.98.210 -f -N mongo --port 4321```
- For the password check the .env file

# Creating new files under routes and schema directories
- Use singular name for the schema directory file naming e.g. business.js
-- This will allow the setup.js file to find the schema is needed to create a collection if it is necessary
- Use plural name for the routes directory file naming e.g. businesses.js

