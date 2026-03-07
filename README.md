# ClinicFlow 🏥

A full-stack clinic management system built with **ASP.NET Core Web API** and **React + TypeScript**.

## Tech Stack
### Backend
- ASP.NET Core (.NET)
- Entity Framework Core (SQLite)
- C#
- RESTful API
- Swagger / OpenAPI

### Frontend
- React
- TypeScript
- Vite
- React Router DOM
- Axios

## Features
### Role-Based Authorization
- **Admin**: View, Create, Update, Delete appointments
- **User**: View and Update status only
#### Security Flow
- User Login (Demo users provided)
- Receive JWT and Store in context / localStorage
- Attach to every API request via Axios Interceptors
- Backend validates token & authorizes based on role

### Modern UI & Layout
- Global application layout with a collapsible sidebar and unified topbar.
- Responsive, clean, and modern styling (gradients, card shadows, rounded aesthetics) entirely built with inline React styles.
- Integrated routing for separated logical views (Dashboard, Appointments, Patients, Doctors, etc.).

### Appointments Management
- **List View**: Display all appointments in an elegant table.
- **Calendar View**: Interactive, dynamic calendar to visualize monthly appointments. Features date switching (prev/next month), highlighting 'Today', and rendering color-coded appointment badges directly on the calendar grid.
- **Create Appointment**: Dedicated form interface with validation (EndTime > StartTime).
- **Manage Appointments**: Update status or instantly drop (delete) appointments.

### Patients Management
- **List View**: Display all registered patients in a clean, modern table matching the app's visual identity.
- **Create Patient**: Highly polished data entry form for easily adding new patients into the clinic domain.


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