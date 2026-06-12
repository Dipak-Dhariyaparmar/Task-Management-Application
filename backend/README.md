# Task Management Application (MERN Stack)

A full-stack Task Management application built with React 18, Node.js, Express.js, MongoDB, TypeScript, and Socket.io.

## Features

* JWT Authentication with secure login
* Role-Based Access Control (Admin & User)
* Password hashing using bcryptjs
* Real-time notifications using Socket.io
* Responsive UI with Tailwind CSS

## Admin Capabilities

* Create and assign tasks to users
* View all tasks in the system
* Receive real-time task updates

## User Capabilities

* View only assigned tasks
* Update task status (Todo, In Progress, Done)
* Receive instant task assignment notifications

## Tech Stack

**Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Axios, Socket.io Client

**Backend:** Node.js, Express.js, TypeScript, MongoDB, Mongoose, JWT, bcryptjs, Socket.io

## Setup

1. Install dependencies:

   * `npm install` (frontend & backend)
2. Configure `.env` files.
3. Start MongoDB.
4. Run database seed:

   * `npm run seed`
5. Start backend:

   * `npm run dev`
6. Start frontend:

   * `npm run dev`

## Test Credentials

* Admin: [admin@test.com](mailto:admin@test.com) / admin123
* User1: [user1@test.com](mailto:user1@test.com) / user123
* User2: [user2@test.com](mailto:user2@test.com) / user123

## API Highlights

* Authentication with JWT
* Task creation and assignment
* Task status updates
* User management endpoints

This project demonstrates authentication, authorization, task management, and real-time communication in a modern MERN stack application.
