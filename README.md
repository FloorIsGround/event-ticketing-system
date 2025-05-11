# EventTicketingSystem

Version: 1.0.0  
Author: Jace Hesford  
License: ISC

A REST API for an event ticketing system. This application allows users to register, login, view events, create bookings, and manage events and bookings based on user roles (user/admin).

For a current deployment: [I'm using Render](https://event-ticketing-system-fm9m.onrender.com/)

## Features

*   User authentication (registration and login) using JWT.
*   Bcrypt password salting and hashing for password storage in a database.
*   Role-based access control (user and admin).
*   CRUD operations for Events (Admin only for Create, Update, Delete).
*   CRUD operations for Bookings (Users can create and view their bookings; Admins can view all bookings).
*   MongoDB for data storage.

## Prerequisites

*   [Node.js](https://nodejs.org/) (v18.x or later recommended, I used 22)
*   [npm](https://www.npmjs.com/) (usually comes with Node.js)
*   [MongoDB](https://www.mongodb.com/try/download/community) (either a local instance or a cloud-hosted solution like MongoDB Atlas)
*   [Nodemon](https://nodemon.io/) (for development, installed as a dev dependency)

## Getting Started

### 1. Clone the Repository

```bash
git clone FloorIsGround/event-ticketing-system.git
cd EventTicketingSystem
```

### 2. Install Dependencies

Install the project dependencies using npm:

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory of the project. This file will store your environment-specific configurations.

```
PORT=3000
DATABASE_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
```

*   `PORT`: The port on which the server will run (defaults to 3000 if not set).
*   `DATABASE_URI`: Your MongoDB connection string.
    *   Example for MongoDB Atlas: `mongodb+srv://<username>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority`
*   `JWT_SECRET`: A strong, random string used to sign and verify JSON Web Tokens.

### 4. Running the Application

To start the server in development mode (with Nodemon for automatic restarts on file changes):

```bash
npm start
```

The server will start, and you should see a message like `Server running on port 3000` and `Connected to MongoDB` in your console.

## API Endpoints

The main entry point for the API is `server.js`.

*   **Authentication (`/api/auth`)**
    *   `POST /api/auth/register`: Register a new user.
    *   `POST /api/auth/login`: Login an existing user and receive a JWT.
*   **Events (`/api/events`)**
    *   `GET /api/events`: Get all events (public).
    *   `GET /api/events/:id`: Get a single event by ID (public).
    *   `POST /api/events`: Create a new event (admin only).
    *   `PUT /api/events/:id`: Update an event (admin only).
    *   `DELETE /api/events/:id`: Delete an event (admin only).
*   **Bookings (`/api/bookings`)**
    *   `GET /api/bookings`: Get bookings (admin sees all, user sees their own).
    *   `GET /api/bookings/:id`: Get a single booking by ID (user only).
    *   `POST /api/bookings`: Create a new booking (users only).

## Project Structure

*   `server.js`: Main application entry point.
*   `dbConfig.js`: MongoDB connection configuration.
*   `routes/api/`: Contains route definitions for users, events, bookings.
*   `controllers/`: Contains the logic for handling requests.
*   `models/`: Contains Mongoose schema definitions.
*   `middleware/`: Contains custom middleware (e.g., authentication, authorization).
*   `view/`: Contains static HTML files (e.g., `index.html`, `404.html`).
*   `.env`: Environment variable configuration, use `.env.example`.

## Key Dependencies

*   **Express**: Web framework for Node.js.
*   **Mongoose**: for MongoDB.
*   **jsonwebtoken (JWT)**: For generating and verifying authentication tokens.
*   **bcrypt**: For salting and hashing passwords.
*   **dotenv**: For loading environment variables.
*   **date-fns**: For date formatting, easy date search.
*   **Nodemon**: For automatic server restarts during development.

---

This README provides a basic guide to setting up and running the EventTicketingSystem.
```