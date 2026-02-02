Project Management System (Full-Stack Application)
A modern full-stack Project Management System that allows users to manage projects, create and track tickets, assign tasks, collaborate with team members, and monitor progress through an interactive dashboard.
Built using React.js, Node.js, Express.js, PostgreSQL, and Supabase, and deployed on Vercel and Render.
🎥 Project Demo Video
https://drive.google.com/file/d/1yzIfQGs59ZJqyiQD2mISeXqp4-FJpA8P/view?usp=drivesdk
🌐 Live Application
Frontend (Vercel):
https://project-management-app-frontend-git-main-labmantix.vercel.app/dashboard
Backend (Render):
https://project-management-app-backend-awuc.onrender.com
📂 GitHub Repositories
Backend:
https://github.com/romasanyal05/project-management-app-backend
Frontend:
https://github.com/romasanyal05/project-management-app-frontend.git
✨ Key Features
User Registration & Login
Role-based Access (Admin / User)
Create & Manage Projects
Add / Remove Team Members
Create, Update & Delete Tickets
Assign Tickets to Users
Ticket Priority & Status Management
Comments on Tickets
Dashboard with Project Statistics
🛠 Tech Stack
Frontend
React.js
HTML5
CSS3
JavaScript (ES6)
Backend
Node.js
Express.js
Database
PostgreSQL
Supabase (PostgreSQL Cloud)
Deployment
Frontend: Vercel
Backend: Render
📁 Project Structure
Backend
project-management-app-backend/
└── server/
    ├── index.js
    ├── package.json
    └── .env
    Frontend
    project-management-app-frontend/
├── src/
├── public/
└── package.json
⚙️ Local Setup
1. Clone Repositories
git clone https://github.com/romasanyal05/project-management-app-backend
git clone https://github.com/romasanyal05/project-management-app-frontend
2. Backend Setup
cd project-management-app-backend/server
npm install
Create .env file:
PORT=5000
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/project_management
NODE_ENV=development
Run backend:
node index.js
Backend runs at:
http://localhost:5000
3. Frontend Setup
cd project-management-app-frontend
npm install
npm start
🔗 API Overview
Authentication
POST /users – Register
POST /login – Login
Projects
GET /projects
POST /projects
PUT /projects/:id
DELETE /projects/:id
Tickets
GET /tickets
POST /tickets
PUT /tickets/:id
DELETE /tickets/:id
Comments
POST /comments
GET /comments/:ticketId
🧪 Backend Health Check
http://localhost:5000/test-db
Expected response:
Json
{ "ok": true }
👩‍💻 Author
Garima Bhushan
