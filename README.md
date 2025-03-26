# Storecart Server

## Overview

Storecart Server is the backend component of the Education Management System. It provides a robust API for managing educational institutions, students, staff, courses, and administrative functions. Built with Node.js and Express, it follows a modular, service-oriented architecture with clear separation of concerns.

## Features

- **User Authentication & Authorization**: Secure JWT-based authentication with role-based access control
- **Institution Management**: Register and manage educational institutions
- **User Management**: Handle different user types (administrators, teachers, students, parents)
- **Course Management**: Create and manage courses, assignments, and grades
- **Communication**: Email notifications and messaging system
- **Data Management**: Efficient CRUD operations with MongoDB

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Email Service**: Brevo (SendinBlue)
- **Logging**: Winston

## Project Structure

```
server/
├── src/                  # Source code
│   ├── constants/        # Application constants
│   ├── email-templates/  # Email templates
│   ├── features/         # Feature modules
│   ├── helpers/          # Helper utilities
│   ├── middleware/       # Express middleware
│   ├── models.js         # Database models
│   └── index.js          # Application entry point
├── .env                  # Environment variables
└── package.json          # Project dependencies and scripts
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn package manager

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/your-username/storecart.git
   cd storecart/server
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Configure environment variables
   Create a `.env` file in the server directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/Storecart
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRES_IN=7d
   SENDINBLUE_API_KEY=your_sendinblue_api_key
   ```

### Running the Server

#### Development Mode

```bash
npm run dev
# or
yarn dev
```

This will start the server with nodemon, which automatically restarts the server when file changes are detected.

#### Production Mode

```bash
npm start
# or
yarn start
```

## API Documentation

The API endpoints are organized by feature modules:

- **Auth**: `/api/auth` - Registration, login, password reset
- **Users**: `/api/users` - User management
- **Institutions**: `/api/institutions` - Institution management
- **Courses**: `/api/courses` - Course management
- **Students**: `/api/students` - Student management

A Postman collection (Storecart.json) is included in the repository for testing the API endpoints.

## Architecture

The application follows a modular architecture with several layers:

1. **Helper Layer**: Utilities for authentication, data management, communication, etc.
2. **Middleware Layer**: Request validation, authentication checks, error handling
3. **Features Layer**: Modular implementation of business logic and routes

For more details, see the [architecture documentation](./builder-rules/architecture.md).

## Future Improvements

- Implement real-time notifications using WebSockets
- Add support for file uploads and storage
- Enhance reporting and analytics features
- Implement caching for improved performance
- Add comprehensive test coverage (unit and integration tests)
- Create a CI/CD pipeline for automated testing and deployment
- Implement rate limiting and additional security measures
- Add support for multiple languages (i18n)

## Deployment

### Docker Deployment

1. Build the Docker image
   ```bash
   docker build -t Storecart-server .
   ```

2. Run the container
   ```bash
   docker run -p 5000:5000 Storecart-server
   ```

### Traditional Deployment

1. Set up a production environment (e.g., AWS, DigitalOcean)
2. Install Node.js and MongoDB
3. Clone the repository and install dependencies
4. Configure environment variables
5. Use a process manager like PM2 to run the application
   ```bash
   npm install -g pm2
   pm2 start src/index.js --name Storecart-server
   ```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.