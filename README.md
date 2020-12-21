# Setting up MongoDB Compass
- Use this command on local device to see it in compass and enabling express to connect <br>
```ssh -L 4321:localhost:27017 root@142.93.98.210 -f -N mongo --port 4321```
- For the password check the .env file

# Creating new files under routes and schema directories
- Use singular name for the schema directory file naming e.g. business.js
-- This will allow the setup.js file to find the schema is needed to create a collection if it is necessary
- Use plural name for the routes directory file naming e.g. businesses.js

# Server Git Pull
- ssh root@142.93.98.210
- cd /var/www/makasapp.com
- password
- git pull
- password2 = makas
- if new package installed run "npm install"
- pm2 restart pm2.server.config.js --update-env
- sudo systemctl restart nginx
