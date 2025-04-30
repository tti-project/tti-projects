# Task Tracking Interface (TTI)

A comprehensive task management system with a Node.js backend and Angular frontend.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [System Requirements](#system-requirements)
- [Setup Instructions](#setup-instructions)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Running the Applications](#running-the-applications)
- [API Documentation](#api-documentation)
- [Dashboard and Statistics](#dashboard-and-statistics)
- [Troubleshooting](#troubleshooting)

## Overview

Task Tracking Interface (TTI) is a full-stack application designed to help teams manage projects and tasks efficiently. The system consists of a RESTful API backend built with Node.js/Express and a responsive frontend built with Angular.

## Features

- User authentication and authorization
- Workspace and project management
- Task creation, assignment, and tracking
- Real-time statistics and dashboard
- User activity monitoring
- Project member distribution visualization

## System Requirements

- Node.js (v14.x or higher)
- npm (v6.x or higher)
- MongoDB (v4.x or higher)
- Angular CLI (v15.x or higher)

## Setup Instructions

### Backend Setup

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd tti-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd ../tti-frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure the environment:
   - Update `src/environments/environment.ts` with your backend API URL:
     ```typescript
     export const environment = {
       production: false,
       apiUrl: "http://localhost:3000/api",
     };
     ```

## Running the Applications

### Backend

1. Start the backend server:

   ```bash
   cd tti-backend
   npm run start
   ```

   For development with auto-reload:

   ```bash
   npm run dev
   ```

2. The API will be available at `http://localhost:3000/api`

### Frontend

1. Start the Angular development server:

   ```bash
   cd tti-frontend
   ng serve
   ```

2. Access the application in your browser at `http://localhost:4200`

## API Documentation

The backend API provides the following endpoints:

- **Authentication**

  - POST `/api/auth/register` - Register a new user
  - POST `/api/auth/login` - Login and get JWT token

  - POST `/api/auth/refresh-token` - Refresh JWT token
  - POST `/api/auth/logout` - Logout and invalidate token

## Authentication

The application uses JWT (JSON Web Token) authentication. Here's how to use it:

### User Credentials

For testing purposes, you can use the following credentials:

- **Admin User**:
  - Email: admin@gmail.com
  - Password: admin123

### Token Management

- Access tokens expire after a set period
- The system automatically refreshes tokens in the background
- Tokens are stored in localStorage for persistence between sessions

- **Workspaces**

  - GET `/api/workspaces` - Get all workspaces
  - POST `/api/workspaces` - Create a new workspace
  - GET `/api/workspaces/:id` - Get workspace by ID
  - PUT `/api/workspaces/:id` - Update workspace
  - DELETE `/api/workspaces/:id` - Delete workspace

- **Projects**

  - GET `/api/projects` - Get all projects
  - POST `/api/projects` - Create a new project
  - GET `/api/projects/:id` - Get project by ID
  - PUT `/api/projects/:id` - Update project
  - DELETE `/api/projects/:id` - Delete project

- **Tasks**

  - GET `/api/tasks` - Get all tasks
  - POST `/api/tasks` - Create a new task
  - GET `/api/tasks/:id` - Get task by ID
  - PUT `/api/tasks/:id` - Update task
  - DELETE `/api/tasks/:id` - Delete task

- **Statistics**
  - GET `/api/statistics/tasks-over-time` - Get task creation statistics
  - GET `/api/statistics/project-members` - Get project member distribution
  - GET `/api/statistics/user-activity` - Get user activity statistics

## Dashboard and Statistics

The dashboard provides visual representations of:

1. Tasks created over time
2. Project member distribution
3. User activity metrics including:
   - Task count
   - Completed tasks
   - Completion rate

## Troubleshooting

### Common Issues

1. **Connection to MongoDB fails**

   - Ensure MongoDB is running on your system
   - Verify the connection string in the `.env` file

2. **Environment Variables**

   Make sure your `.env` file is properly configured with the following variables:

   ```
   PORT=3000
   MONGODB_URI=mongodb+srv://username:password@cluster.example.mongodb.net/db_name
   NODE_ENV=development
   JWT_REFRESH_SECRET=your_refresh_secret_key
   JWT_SECRET=your_secret_key
   EMAIL_USER=your_email@example.com
   EMAIL_PASS=your_email_password
   FRONTEND_URL=http://localhost:4200
   ```

   Note: Replace the placeholder values with your actual configuration. Never commit your real credentials to version control.

3. **JWT token issues**

   - Check that the JWT_SECRET in the `.env` file is properly set
   - Ensure the token hasn't expired

4. **CORS errors**

   - The backend has CORS middleware enabled, but you may need to adjust settings if hosting on different domains

5. **Chart data not loading**
   - Check browser console for API errors
   - Verify that statistics routes are working properly

For additional help, please open an issue in the repository or contact the development team.
