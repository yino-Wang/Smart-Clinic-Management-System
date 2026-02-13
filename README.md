# ClinicFlow 🏥

A full-stack clinic management system built with **ASP.NET Core Web API** and **React + TypeScript**.

## Tech Stack
### Backend
- ASP.NET Core (.NET)
- C#
- RESTful API
- Swagger / OpenAPI

### Frontend
- React
- TypeScript
- Vite
- Axios

## Features
### Role-Based Authorization
- Admin : View, Create, Update, Delete appointments
User
- User : View and Update status only
#### SecurityFlow
- User Login
- Receive JWT
- Store in localStorage
- Attach to every API request
- Backend validates token
- Authorize based on role
### Create Appointment
### Delete Appointment
### Update Status
### Validation (EndTime > StartTime)

## Project Structure
- clinicflow
- ├─ backend
- │ └─ ClinicFlow.Api
- ├─ frontend
- │ └─ clinicflow-web


## Getting Started

### Backend
```bash
cd backend/ClinicFlow.Api
dotnet run

cd frontend/clinicflow-web
npm install
npm run dev
```

Author

Yino