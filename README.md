# Food Bank Information System

## Development Environment Instructions
1. Clone the repository onto your local machine
2. Ensure you have a working MySQL service running locally.
3. Go into the Technical Work/server folder
4. Run command: 'npm install --include=dev'
5. Once completed, create a .env file in the server root folder. This should include the following in the format DB_HOST=localhost:
   1. DB_HOST - hostname of the database, likely 'localhost'
   2. DB_PORT - The port the database is on. For local environment, likely to be 3306
   3. DB_USER - Database username
   4. DB_PASS - Database password
   5. DB_NAME - The name of the database
   6. SECRET_KEY - The secret key used for encryption. Please note - should be a secure and generated hex.
6. Run command 'npm run dev'.
7. If you instead with to build the project, use command 'npm run build'. the dev command includes watching of changes for files.