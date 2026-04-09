# EduTrack Frontend Implementation Guide

This document walks through every page/screen the frontend must implement, what API calls to make, what to display, and what actions are available — for both **teacher** and **student** roles.

---

## 0. Global Frontend Setup

### Token Storage
After login or register, store the JWT token and role:
```js
localStorage.setItem("token", data.token);
localStorage.setItem("role", data.role);
localStorage.setItem("userId", data.id);
localStorage.setItem("userName", data.name);
```

### Authenticated API calls
Every protected API call must include the Authorization header:
```js
const res = await fetch("/api/some/route", {
  headers: {
    "Authorization": `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json"
  }
});
```

### Role-based routing
On app load, read `role` from localStorage:
- If `teacher` → show teacher layout/pages
- If `student` → show student layout/pages
- If no token → redirect to login

### 401 / 403 handling
If any API call returns `401`, clear the token and redirect to login.  
If `403`, show "Access denied" — the user shouldn't have reached that page.

---

## 1. Auth Pages

### 1.1 Register Page
Two separate forms (or tabs): **Register as Teacher** / **Register as Student**

Fields: `name`, `email`, `password`

API calls:
- `POST /api/auth/register-teacher`
- `POST /api/auth/register-student`

On success: Store token + role, redirect to dashboard.

---

### 1.2 Login Page
Single page — the backend auto-detects role from email.

Fields: `email`, `password`

API call: `POST /api/auth/login`

On success: Store token + role + name, redirect to dashboard.

---

## 2. Shared: Profile Page (`/profile`)

Both roles see this page.

**Display:** name, email, account creation date, role badge

**Edit form:** name, email, optional new password

API calls:
- `GET /api/auth/me` → load profile
- `PUT /api/teachers/me` OR `PUT /api/students/me` → save changes

---

## 3. TEACHER Pages

### 3.1 Teacher Dashboard (`/teacher/dashboard`)

Overview page. Fetch:
- `GET /api/teachers/groups` → count of groups
- `GET /api/teachers/modules` → count of modules
- `GET /api/teachers/submissions` → count of recent submissions

Display:
- Quick stats cards (# of groups, # of modules, # of pending submissions)
- Recent submission activity list (from the submissions endpoint)

---

### 3.2 Modules Page (`/teacher/modules`)

**List view:** All teacher's modules
- API: `GET /api/modules`
- Display: title, description, date created
- Options: Edit, Delete

**Create module button** → modal/form:
- API: `POST /api/modules`
- Body: `{ name, description }`

**Edit module** → pre-filled modal:
- API: `PUT /api/modules/:id`

**Delete module:**
- API: `DELETE /api/modules/:id`
- Confirm before deleting

**Assign to group button** (on each module or via a dedicated UI):
- Show a dropdown of the teacher's groups
- API: `POST /api/modules/assign` with `{ module_id, group_id }`
- Show current assignments (from `GET /api/groups/:id` which returns `modules` array)
- Allow removing: `DELETE /api/modules/assign`

---

### 3.3 Groups Page (`/teacher/groups`)

**List view:** All teacher's groups
- API: `GET /api/groups`
- Display: name, year, invite_code (if active + not expired), expiry time

**Create group:**
- API: `POST /api/groups`
- Body: `{ name, year }`

**Edit / Delete group:**
- `PUT /api/groups/:id`, `DELETE /api/groups/:id`

**Group detail page** (`/teacher/groups/:id`):
- API: `GET /api/groups/:id` → shows group info + assigned modules
- Assigned modules list with option to unassign

**Generate invite code button:**
- API: `POST /api/groups/:id/generate-code`
- Display the returned `invite_code` prominently with a **Copy** button
- Show expiry time (24 hours)

**Students tab in group detail:**
- API: `GET /api/groups/:id/students`
- Display: student name, email, join date

---

### 3.4 Workshops Page (`/teacher/workshops`)

**Entry point:** Teacher selects a Group first, then navigates inside.

**Group → Workshops list** (`/teacher/groups/:groupId/workshops`):
- API: `GET /api/workshops/group/:groupId`
- Display each workshop: title, module, date, resource links (pdf/repo/web)

**Create workshop:**
- API: `POST /api/workshops`
- Body: `{ module_id, group_id, title, description, pdf_report, repo, web_page }`
- `module_id` → dropdown from teacher's modules assigned to this group
- `group_id` → pre-filled from the current group context

**Edit / Delete workshop:**
- `PUT /api/workshops/:id`, `DELETE /api/workshops/:id`

**Workshop detail** → show submissions:
- API: `GET /api/workshops/workshop-submissions/workshop/:workshopId`
- Display: student name, submission date, repo/web/pdf links

**Submissions by group:**
- API: `GET /api/workshops/workshop-submissions/group/:groupId`
- Table: student, workshop, submission links, date

---

### 3.5 Agile Page (`/teacher/agile`)

Teacher selects a group → sees teams + sprints.

**Agile teams list:**
- API: `GET /api/agile/teams/:groupId`
- Each team: name + members list
- Teacher can delete a team: `DELETE /api/agile/teams/:teamId`

**Sprints list:**
- API: `GET /api/sprints/group/:groupId`
- Display: sprint title, module, resources

**Create sprint:**
- API: `POST /api/sprints`
- Body: `{ module_id, group_id, title, description, repo, web_page, pdf_report }`

**Edit / Delete sprint:**
- `PUT /api/sprints/:id`, `DELETE /api/sprints/:id`

**Sprint submissions:**
- API: `GET /api/sprints/sprint-submissions/sprint/:sprintId`
- Table: team name, repo, web_page, pdf, submission date

---

### 3.6 PFE Page (`/teacher/pfe`)

Teacher selects a group → sees PFE teams + submissions.

**PFE teams list:**
- API: `GET /api/pfe/teams/:groupId`
- Each team: name + members

**Delete PFE team:**
- API: `DELETE /api/pfe/teams/:teamId`

**PFE submissions list:**
- API: `GET /api/pfe/submissions/:groupId`
- Display: team name, project title, repo, demo, video, pdf

---

### 3.7 Internships Page (`/teacher/internships`)

Teacher selects a group → sees all internship submissions of students.

**API:** `GET /api/internships/group/:groupId`

**Display table:**
- Student name, email, company, supervisor, start/end dates, report PDF link

---

### 3.8 Submissions Dashboard (`/teacher/submissions`)

Quick all-in-one view.

**API:** `GET /api/teachers/submissions`

Display three sections/tabs:
1. **Workshop submissions** — filter by group or module
2. **Sprint submissions** — filter by group or sprint
3. **PFE submissions** — filter by group

---

## 4. STUDENT Pages

### 4.1 Student Dashboard (`/student/dashboard`)

**API calls:**
- `GET /api/students/groups` → how many groups joined
- `GET /api/students/modules` → how many modules
- `GET /api/students/submissions` → recent submissions

Display:
- "My Groups" count card
- "My Modules" count card
- Recent activity (latest workshop / sprint / PFE submissions)

---

### 4.2 My Groups Page (`/student/groups`)

**API:** `GET /api/groups/student/my-groups`

Display: group name, teacher name, year, joined date.

**Join group button** → modal:
- Input: invite code
- API: `POST /api/groups/join` with `{ invite_code }`
- On success: group appears in list

Clicking a group → group detail page.

---

### 4.3 Group Detail Page (`/student/groups/:groupId`)

Display:
- Group name + year
- Teacher name + email
- Modules this teacher teaches in this group:
  - From `GET /api/students/modules` filtered by `group_id`

Tabs:
- **Workshops** → navigate to workshops page in context of this group
- **Agile** → agile section for this group
- **PFE** → PFE section for this group

---

### 4.4 Workshops Page (`/student/workshops`)

**My workshops (across all groups):**
- API: `GET /api/workshops/student`
- Display: workshop title, module, teacher, group, description, resources

**Submit button** (on each workshop):
- Form modal: `repo`, `web_page`, `pdf_report` (all optional, but fill at least one)
- API: `POST /api/workshops/:id/submit`
- After submitting: show "Submitted ✓" badge on the workshop card
- If already submitted → show submission info instead of form

**My submissions page** (`/student/submissions/workshops`):
- API: `GET /api/workshops/workshop-submissions/my`
- Table: workshop title, module, submitted at, links

---

### 4.5 Agile Page (`/student/agile`)

Student selects a group from their groups list.

**Per group:**

**Classmates list:**
- API: `GET /api/agile/students/:groupId`
- Shows all group members (to invite into team)

**My team section:**
- API: `GET /api/agile/teams/:groupId` → find team where current student is a member
- If in a team: show team name + members
- If NOT in a team: show two options:
  1. **Create team** → form with team name → `POST /api/agile/teams`
  2. **Join team** → list of existing teams + join button → `POST /api/agile/teams/join` with `{ team_id }`

**Sprints list:**
- API: `GET /api/sprints/group/:groupId`
- Display: sprint title, description, module, teacher resources (pdf/repo/web)

**Submit sprint button** (per sprint, if student is in an agile team):
- Form modal: `repo`, `web_page`, `pdf_report`
- API: `POST /api/sprints/:id/submit` with `{ agile_team_id, repo, web_page, pdf_report }`
- Show "Submitted ✓" if team already submitted

**Team submissions history:**
- API: `GET /api/sprints/sprint-submissions/team/:teamId`

---

### 4.6 PFE Page (`/student/pfe`)

Student selects a group.

**PFE teams in group:**
- API: `GET /api/pfe/teams/:groupId`

**My PFE team section:**
- If in a team: show team + members + their submission status
- If NOT in a team:
  1. **Create PFE team** → `POST /api/pfe/teams` with `{ group_id, name }`
  2. **Join PFE team** → list existing teams + join → `POST /api/pfe/teams/join`

**PFE submission** (if in a team):
- Check if already submitted: `GET /api/pfe/submissions/team/:teamId`
- If not submitted: show form with all fields
- API: `POST /api/pfe/submit`
- Fields: `pfe_team_id`, `project_title`, `description`, `project_repo`, `project_demo`, `explanation_video`, `report_pdf`

---

### 4.7 Internship Page (`/student/internship`)

**View current submissions:**
- API: `GET /api/internships/me`

**Submit internship button (if none submitted):**
- API: `POST /api/internships`
- Fields: `company_name`, `supervisor_name`, `start_date`, `end_date`, `report_pdf`

**Edit existing internship:**
- API: `PUT /api/internships/:id`
- Pre-fill form with existing data

---

### 4.8 My Submissions Page (`/student/submissions`)

Aggregated view of everything submitted.

**API:** `GET /api/students/submissions`

Three tabs:
1. **Workshops** — workshop title, module, group, date, links
2. **Sprints** — sprint title, team name, group, date, links
3. **PFE** — project title, team name, group, date, all links

---

## 5. Important Edge Cases to Handle

| Scenario | How to handle |
|---|---|
| Invite code expired | Show "Code has expired. Ask teacher to generate a new one." |
| Already joined group | Show "Already in this group" info instead of join button |
| Already submitted workshop/sprint | Show submission data, remove submit button |
| Student not in any agile team | Show "Create or join a team first" before showing sprint submit |
| PFE team has no submission yet | Show "No submission yet" with submit button |
| Empty lists (no modules, no workshops etc.) | Show empty state UI — "Nothing here yet" |
| Token expired (401 response) | Clear localStorage, redirect to `/login` |

---

## 6. Page-to-API Quick Reference

| Frontend Page | API Calls Used |
|---|---|
| Login | `POST /auth/login` |
| Register | `POST /auth/register-teacher`, `POST /auth/register-student` |
| Profile | `GET /auth/me`, `PUT /teachers/me` or `/students/me` |
| Teacher Dashboard | `GET /teachers/groups`, `/teachers/modules`, `/teachers/submissions` |
| Teacher Modules | `GET/POST/PUT/DELETE /modules`, `POST/DELETE /modules/assign` |
| Teacher Groups | `GET/POST/PUT/DELETE /groups`, `POST /groups/:id/generate-code`, `GET /groups/:id/students` |
| Teacher Workshops | `GET/POST/PUT/DELETE /workshops`, `GET /workshops/workshop-submissions/workshop/:id` |
| Teacher Agile | `GET /agile/teams/:groupId`, `DELETE /agile/teams/:teamId`, `GET/POST/PUT/DELETE /sprints`, `GET /sprints/sprint-submissions/sprint/:id` |
| Teacher PFE | `GET /pfe/teams/:groupId`, `DELETE /pfe/teams/:teamId`, `GET /pfe/submissions/:groupId` |
| Teacher Internships | `GET /internships/group/:groupId` |
| Student Dashboard | `GET /students/groups`, `/students/modules`, `/students/submissions` |
| Student Groups | `GET /groups/student/my-groups`, `POST /groups/join` |
| Student Workshops | `GET /workshops/student`, `POST /workshops/:id/submit`, `GET /workshops/workshop-submissions/my` |
| Student Agile | `GET /agile/students/:groupId`, `POST/GET /agile/teams`, `POST /agile/teams/join`, `GET /sprints/group/:groupId`, `POST /sprints/:id/submit` |
| Student PFE | `GET/POST /pfe/teams`, `POST /pfe/teams/join`, `POST /pfe/submit`, `GET /pfe/submissions/team/:teamId` |
| Student Internship | `GET/POST /internships`, `PUT /internships/:id` |
| Student Submissions | `GET /students/submissions` |
