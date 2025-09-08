2loy Car Aircon Services

2loy Car Aircon Services is your one-stop solution for car air conditioning repair and maintenance. We offer fast, reliable, and affordable aircon services to keep your vehicle cool and running smoothly. Whether it's a simple repair, a re-gas, or a full AC overhaul, we've got you covered.

Badges

Table of Contents

Installation

Running the Project

Usage

Tech Stack

API Documentation

License

Contributing

Installation
Backend (Node.js/Express, MySQL)

Clone the repository:

git clone https://github.com/yourusername/2loy-car-aircon-services.git


Navigate to the server folder and install dependencies:

cd server
npm install


Set up your environment variables by creating a .env file in the root of the server directory. Include the following MySQL configuration:

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=car_service_db
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
JWT_SECRET="nd8raiIcgku+9kVkD+GSxXfdLUAiTlW8SDPhJQS7lNc="
EMAIL_USER="your_email@gmail.com"
EMAIL_PASS="your_email_password"


Run the server:

npm start

Frontend (React/Vite)

Navigate to the client folder and install dependencies:

cd client
npm install


Run the frontend:

npm run dev

Running the Project

Make sure both the backend and frontend are running. You should now be able to visit the app locally.

Backend is typically running at http://localhost:5000

Frontend is typically running at http://localhost:5173

Usage

After setting up the project, navigate to http://localhost:5173 in your browser to see the application in action. The application allows you to book car aircon repair services, view the available packages, and check service history.

Tech Stack

Frontend: React, Vite

Backend: Node.js, Express

Database: MySQL, Prisma (for ORM)

Authentication: JWT (JSON Web Tokens)

State Management: Redux (optional, if using state management)

Others: Axios for API calls

API Documentation
Auth API

POST /api/auth/login

Logs a user in with credentials.

POST /api/auth/register

Registers a new user.

Car Services API

GET /api/services

Retrieves a list of available aircon services.

POST /api/bookings

Allows users to book a service.

Other Routes

(List additional backend routes here)

License

This project is licensed under the MIT License - see the LICENSE
 file for details.
