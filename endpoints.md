Houdaifa, let’s build a **complete, professional API map** for your EduTrack backend.  
This includes **every endpoint you realistically need** based on your database and flow. I grouped them by feature so the structure stays clean and scalable.

Base API prefix:

```
/api
```

---

# 1. Authentication

Route base:

```
/api/auth
```

### Register

|Method|Endpoint|Description|
|---|---|---|
|POST|`/auth/register/teacher`|Teacher creates account|
|POST|`/auth/register/student`|Student creates account|

Example body:

```json
{
  "name": "Karim",
  "email": "karim@email.com",
  "password": "123456"
}
```

---

### Login

|Method|Endpoint|Description|
|---|---|---|
|POST|`/auth/login`|login teacher or student|

Response:

```json
{
  "token": "jwt_token",
  "role": "teacher"
}
```

---

### Current user

|Method|Endpoint|Description|
|---|---|---|
|GET|`/auth/me`|return logged user info|

---

# 2. Teacher Profile

Route base:

```
/api/teachers
```

|Method|Endpoint|Description|
|---|---|---|
|GET|`/teachers/me`|teacher profile|
|PUT|`/teachers/me`|update profile|

---

# 3. Student Profile

Route base:

```
/api/students
```

|Method|Endpoint|Description|
|---|---|---|
|GET|`/students/me`|student profile|
|PUT|`/students/me`|update profile|

---

# 4. Modules

Route base:

```
/api/modules
```

Teacher CRUD modules.

|Method|Endpoint|Description|
|---|---|---|
|POST|`/modules`|create module|
|GET|`/modules`|teacher modules|
|GET|`/modules/:id`|module details|
|PUT|`/modules/:id`|update module|
|DELETE|`/modules/:id`|delete module|

---

### Assign module to group

|Method|Endpoint|
|---|---|
|POST|`/modules/assign`|
|DELETE|`/modules/assign`|

Example:

```json
{
  "module_id": 1,
  "group_id": 3
}
```

---

# 5. Groups

Route base:

```
/api/groups
```

### Teacher CRUD groups

|Method|Endpoint|Description|
|---|---|---|
|POST|`/groups`|create group|
|GET|`/groups`|teacher groups|
|GET|`/groups/:id`|group details|
|PUT|`/groups/:id`|update group|
|DELETE|`/groups/:id`|delete group|

---

### Invite system

|Method|Endpoint|Description|
|---|---|---|
|POST|`/groups/:id/generate-code`|generate invite code|
|GET|`/groups/:id/students`|students of group|

---

### Student joins group

|Method|Endpoint|
|---|---|
|POST|`/groups/join`|

Body:

```json
{
  "invite_code": "ABC123"
}
```

---

### Student groups

|Method|Endpoint|
|---|---|
|GET|`/groups/student/my-groups`|

---

# 6. Workshops

Route base:

```
/api/workshops
```

### Teacher workshops

|Method|Endpoint|Description|
|---|---|---|
|POST|`/workshops`|create workshop|
|GET|`/workshops/module/:moduleId/group/:groupId`|workshops for module+group|
|GET|`/workshops/:id`|workshop details|
|PUT|`/workshops/:id`|update workshop|
|DELETE|`/workshops/:id`|delete workshop|

---

### Student workshops

|Method|Endpoint|
|---|---|
|GET|`/workshops/student`|

Shows all workshops available to student.

---

# 7. Workshop Submissions

Route base:

```
/api/workshop-submissions
```

### Student submits workshop

|Method|Endpoint|
|---|---|
|POST|`/workshop-submissions`|

Body:

```json
{
  "workshop_id": 3,
  "repo": "https://github.com/student/project",
  "web_page": "https://project.com",
  "pdf_report": "https://storage/report.pdf"
}
```

---

### Student submissions

|Method|Endpoint|
|---|---|
|GET|`/workshop-submissions/my`|

---

### Teacher submissions

|Method|Endpoint|
|---|---|
|GET|`/workshop-submissions/workshop/:workshopId`|
|GET|`/workshop-submissions/group/:groupId`|

---

# 8. Agile Teams

Route base:

```
/api/agile
```

### Classmates

|Method|Endpoint|
|---|---|
|GET|`/agile/students/:groupId`|

Returns students of same group.

---

### Teams

|Method|Endpoint|
|---|---|
|POST|`/agile/teams`|
|GET|`/agile/teams/:groupId`|
|GET|`/agile/teams/team/:teamId`|
|DELETE|`/agile/teams/:teamId`|

Example create:

```json
{
  "group_id": 2,
  "name": "Team Alpha"
}
```

---

### Join team

|Method|Endpoint|
|---|---|
|POST|`/agile/teams/join`|

```json
{
  "team_id": 5
}
```

---

# 9. Sprints

Route base:

```
/api/sprints
```

### Teacher sprints

|Method|Endpoint|
|---|---|
|POST|`/sprints`|
|GET|`/sprints/group/:groupId`|
|GET|`/sprints/:id`|
|PUT|`/sprints/:id`|
|DELETE|`/sprints/:id`|

Example create:

```json
{
  "module_id": 1,
  "group_id": 2,
  "title": "Sprint 1",
  "description": "Create API"
}
```

---

# 10. Sprint Submissions

Route base:

```
/api/sprint-submissions
```

### Team submission

|Method|Endpoint|
|---|---|
|POST|`/sprint-submissions`|

Body:

```json
{
  "sprint_id": 2,
  "agile_team_id": 5,
  "repo": "...",
  "web_page": "...",
  "pdf_report": "..."
}
```

---

### View submissions

|Method|Endpoint|
|---|---|
|GET|`/sprint-submissions/team/:teamId`|
|GET|`/sprint-submissions/sprint/:sprintId`|

---

# 11. PFE Teams

Route base:

```
/api/pfe-teams
```

|Method|Endpoint|
|---|---|
|POST|`/pfe-teams`|
|GET|`/pfe-teams/group/:groupId`|
|GET|`/pfe-teams/:teamId`|
|DELETE|`/pfe-teams/:teamId`|

Join team:

|Method|Endpoint|
|---|---|
|POST|`/pfe-teams/join`|

---

# 12. PFE Submissions

Route base:

```
/api/pfe-submissions
```

### Submit PFE

|Method|Endpoint|
|---|---|
|POST|`/pfe-submissions`|

Example:

```json
{
  "pfe_team_id": 3,
  "project_title": "EduTrack",
  "project_repo": "...",
  "project_demo": "...",
  "explanation_video": "...",
  "report_pdf": "..."
}
```

---

### View submissions

|Method|Endpoint|
|---|---|
|GET|`/pfe-submissions/team/:teamId`|
|GET|`/pfe-submissions/group/:groupId`|

---

# 13. Internships

Route base:

```
/api/internships
```

### Student

|Method|Endpoint|
|---|---|
|POST|`/internships`|
|GET|`/internships/me`|
|PUT|`/internships/:id`|

Example:

```json
{
  "company_name": "Google",
  "supervisor_name": "John Doe",
  "start_date": "2025-02-01",
  "end_date": "2025-06-01",
  "report_pdf": "..."
}
```

---

### Teacher

|Method|Endpoint|
|---|---|
|GET|`/internships/group/:groupId`|

---

# Full Endpoint Map

```
/api/auth
/api/teachers
/api/students
/api/modules
/api/groups
/api/workshops
/api/workshop-submissions
/api/agile
/api/sprints
/api/sprint-submissions
/api/pfe-teams
/api/pfe-submissions
/api/internships
```

Total endpoints: **~75 routes**

This is **a complete real-world API surface** for your project.

