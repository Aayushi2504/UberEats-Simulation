UberEATS Prototype
This is a prototype of the UberEATS application built using ReactJS for the frontend, Node.js with Express.js for the backend, and MySQL as the database.

Prerequisites

Before running the application, ensure you have the following installed:

- Node.js: Download and install Node.js from [nodejs.org](https://nodejs.org/).
- MySQL: Install MySQL from [mysql.com](https://www.mysql.com/).
- Git: Install Git from [git-scm.com](https://git-scm.com/).

Setup Instructions

1. Clone the Repository

First, clone the repository to your local machine:

bash:
git clone http://github.com/Aayushi2504/DATA-236/new/main/Lab-1/UberEats
cd Lab-1
2. Set Up the Backend
Navigate to the backend directory:

bash:
Copy
cd backend
Install the required dependencies:

bash:
Copy
npm install
Set up the MySQL database:

Create a new database in MySQL.

Update the database configuration in config/db.config.js with your MySQL credentials.

Run the database migrations (if applicable):

bash:
Copy
npm run migrate
Start the backend server:

bash:
Copy
npm start
The backend server should now be running on http://localhost:5000 (or another port if configured).

3. Set Up the Frontend
Navigate to the frontend directory:

bash:
Copy
cd ../frontend
Install the required dependencies:

bash:
Copy
npm install
Start the frontend development server:

bash:
Copy
npm start
The frontend application should now be running on http://localhost:3000.

4. Access the Application
Open your web browser and navigate to http://localhost:3000 to access the UberEATS prototype.

API Documentation
The API documentation is available using Swagger UI. After starting the backend server, you can access the Swagger documentation at:

Copy
http://localhost:5000/api-docs
Alternatively, you can import the Postman collection provided in the docs folder to test the API endpoints.

Project Structure
backend/: Contains the Node.js and Express.js backend code.

frontend/: Contains the ReactJS frontend code.

docs/: Contains API documentation (Swagger/Postman).

README.md: This file.

Contributing
If you wish to contribute to this project, please follow these steps:

Fork the repository.

Create a new branch for your feature or bugfix.

Commit your changes with detailed commit messages.

Push your branch and submit a pull request.

Copy

Key Points to Customize:
- Repository URL: http://github.com/Aayushi2504/DATA-236/new/main/Lab-1/UberEats
- Database Configuration: Update the path to your database configuration file if it’s different from `config/db.config.js`.
- Ports: If your backend or frontend runs on different ports, update the URLs accordingly.
- API Documentation: If you’re using Postman instead of Swagger, update the instructions accordingly.


Once you’ve customized the `README.md` file, you can commit it to your repository:

bash:
git add README.md
git commit -m "Added README.md with setup instructions"
git push origin main
