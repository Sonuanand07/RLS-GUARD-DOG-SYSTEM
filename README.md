# RLS Guard Dog System

[Live Demo](https://rls-guard-dog-system.vercel.app/)  
LIVE DEPLOY LINK : https://rls-guard-dog-system.vercel.app/

A secure student-classroom progress tracking application that uses Supabase Row-Level Security (RLS) to ensure students only see their own data, while teachers can see/manage data for their classrooms.

---

## 🧰 Technologies Used

| Layer | Technology |
|-------|-------------|
| Authentication & Authorization | Supabase Auth (email/password, roles: student & teacher) |
| Database & RLS Policies | Supabase Postgres |
| ORM / Query Layer | Supabase / SQL |
| Frontend | Next.js (App Router) + React |
| UI / Styling | Tailwind CSS + shadcn/ui (or similar component library) |
| State Management | React Query (TanStack Query), Zustand |
| Deployment | Vercel |

---

## 🔒 Features

- User signup & login (email/password + role-based access)  
- Role types: **Student** & **Teacher**  
- Classrooms table: each classroom belongs to a teacher  
- Enrollment: students are enrolled in classrooms  
- Progress: students have progress records for modules  
- **Row-Level Security**:  
  - Students can only see their own progress and enrolled classroom info  
  - Teachers can view progress & classroom data for students in their classrooms  
- UI Pages include:  
  - Login / Registration  
  - Dashboard / Profile  
  - Classrooms list  
  - Progress table  
  - Student view & Teacher view  
- Responsive design & user experience considerations

---

## 🛠 Database Schema

| Table | Columns | Purpose |
|-------|---------|---------|
| `profiles` | `id`, `email`, `role` | Stores user role (student/teacher) and email |
| `classrooms` | `id`, `name`, `teacher_id` | Defines classroom & which teacher owns it |
| `progress` | `id`, `student_id`, `classroom_id`, `module`, `score`, `updated_at` | Module progress data for students |

---

## 🔐 RLS Policies

- All tables have Row-Level Security enabled  
- Policies implemented:
  1. **profiles**: Users can only select their own profile
  2. **classrooms**: Teachers can view the classrooms they own; students can view classrooms where they are enrolled
  3. **progress**: Students see only their own progress; Teachers see progress for students in their classrooms; Teachers may update progress; students may insert or view their own

---

## 🤝 Setup Instructions (Locally)

1. Clone repo  
   `git clone <repo-url>`  
2. Install dependencies  
   `npm install`  
3. Configure environment variables – create a `.env.local` file  

# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS


Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
