# Full Stack Blog Application

## Overview
This project is a full-stack blog application developed using React for the frontend and Node.js with Express.js for the backend. The application leverages MongoDB for database management and JSON Web Tokens (JWT) for secure user authentication. It supports full CRUD (Create, Read, Update, Delete) operations for blog posts and ensures data integrity and security, providing a seamless and interactive user experience. The state management is handled using Context API.

## Backend

### Technologies Used
- Node.js
- Express.js
- MongoDB (Mongoose)
- JSON Web Tokens (JWT)
- bcryptjs (for password hashing)
- dotenv (for environment variables)

### Features
- User authentication (login/register)
- JWT-based secure authentication
- CRUD operations for blog posts
- User-specific data handling

### Setup Instructions
1. Clone the repository:
    ```sh
    git clone https://github.com/MukeshKr55/MERN-Blog-App-backend.git
    cd MERN-Blog-App-backend
    ```

2. Install the dependencies:
    ```sh
    npm install
    ```

3. Create a `.env` file in the root directory and add the following environment variables:
    ```env
    PORT=5000
    MONGO_URI=<your_mongo_db_connection_string>
    JWT_SECRET=<your_jwt_secret_key>
    ```

4. Start the development server:
    ```sh
    npm run dev
    ```

5. The backend server should now be running on [http://localhost:5000](http://localhost:5000).

### Project Structure
```plaintext
server/
├── controllers/
│ ├── postControllers.js
│ └── userControllers.js
├── middleware/
│ ├── authMiddleware.js
│ └── errorMiddleware.js
├── models/
│ ├── errorModel.js
│ ├── postModels.js
│ └── userModel.js
├── routes/
│ ├── postRoutes.js
│ └── userRoutes.js
├── uploads/
├── .env
├── .gitignore
├── index.js
├── package-lock.json
├── package.json
└── README.md
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login an existing user

### Posts
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create a new post
- `GET /api/posts/:id` - Get a single post by ID
- `PUT /api/posts/:id` - Update a post by ID
- `DELETE /api/posts/:id` - Delete a post by ID
