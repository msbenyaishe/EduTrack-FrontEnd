Awesome, Houdaifa! 🚀  
Here is the **complete, clean, final MySQL database schema** including everything we discussed:

- teachers & students authentication
    
- modules and groups managed by teachers
    
- module ↔ group assignment
    
- workshops & sprint resources (pdf / repo / web page)
    
- workshop submissions
    
- agile teams & sprint submissions
    
- PFE teams & submissions
    
- internships
    

Everything is **normalized and production-ready**.

---

# Full EduTrack Database Schema (MySQL)

```sql
-- =========================================
-- TEACHERS
-- =========================================

CREATE TABLE teachers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- STUDENTS
-- =========================================

CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- MODULES (created by teachers)
-- =========================================

CREATE TABLE modules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    teacher_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (teacher_id) REFERENCES teachers(id)
    ON DELETE CASCADE
);

-- =========================================
-- GROUPS (classes owned by teachers)
-- =========================================

CREATE TABLE groups (
    id INT AUTO_INCREMENT PRIMARY KEY,
    teacher_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    year YEAR NOT NULL,

    invite_code VARCHAR(20),
    invite_expires_at DATETIME,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (teacher_id) REFERENCES teachers(id)
    ON DELETE CASCADE
);

-- =========================================
-- MODULE ↔ GROUP RELATION
-- which module is taught in which group
-- =========================================

CREATE TABLE module_groups (
    id INT AUTO_INCREMENT PRIMARY KEY,
    module_id INT NOT NULL,
    group_id INT NOT NULL,

    FOREIGN KEY (module_id) REFERENCES modules(id)
    ON DELETE CASCADE,

    FOREIGN KEY (group_id) REFERENCES groups(id)
    ON DELETE CASCADE
);

-- =========================================
-- GROUP STUDENTS
-- students join groups via invite code
-- =========================================

CREATE TABLE group_students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    group_id INT NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (student_id) REFERENCES students(id)
    ON DELETE CASCADE,

    FOREIGN KEY (group_id) REFERENCES groups(id)
    ON DELETE CASCADE
);

-- =========================================
-- WORKSHOPS
-- =========================================

CREATE TABLE workshops (
    id INT AUTO_INCREMENT PRIMARY KEY,
    module_id INT NOT NULL,
    group_id INT NOT NULL,

    title VARCHAR(150) NOT NULL,
    description TEXT,

    pdf_report VARCHAR(255),
    repo VARCHAR(255),
    web_page VARCHAR(255),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (module_id) REFERENCES modules(id)
    ON DELETE CASCADE,

    FOREIGN KEY (group_id) REFERENCES groups(id)
    ON DELETE CASCADE
);

-- =========================================
-- WORKSHOP SUBMISSIONS
-- =========================================

CREATE TABLE workshop_submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    workshop_id INT NOT NULL,
    student_id INT NOT NULL,

    pdf_report VARCHAR(255),
    repo VARCHAR(255),
    web_page VARCHAR(255),

    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (workshop_id) REFERENCES workshops(id)
    ON DELETE CASCADE,

    FOREIGN KEY (student_id) REFERENCES students(id)
    ON DELETE CASCADE
);

-- =========================================
-- AGILE TEAMS
-- =========================================

CREATE TABLE agile_teams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    group_id INT NOT NULL,
    name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (group_id) REFERENCES groups(id)
    ON DELETE CASCADE
);

-- =========================================
-- AGILE TEAM MEMBERS
-- =========================================

CREATE TABLE student_agile_teams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    agile_team_id INT NOT NULL,
    student_id INT NOT NULL,

    FOREIGN KEY (agile_team_id) REFERENCES agile_teams(id)
    ON DELETE CASCADE,

    FOREIGN KEY (student_id) REFERENCES students(id)
    ON DELETE CASCADE
);

-- =========================================
-- SPRINTS
-- =========================================

CREATE TABLE sprints (
    id INT AUTO_INCREMENT PRIMARY KEY,
    module_id INT NOT NULL,
    group_id INT NOT NULL,

    title VARCHAR(150),
    description TEXT,

    pdf_report VARCHAR(255),
    repo VARCHAR(255),
    web_page VARCHAR(255),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (module_id) REFERENCES modules(id)
    ON DELETE CASCADE,

    FOREIGN KEY (group_id) REFERENCES groups(id)
    ON DELETE CASCADE
);

-- =========================================
-- SPRINT SUBMISSIONS
-- =========================================

CREATE TABLE sprint_submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sprint_id INT NOT NULL,
    agile_team_id INT NOT NULL,

    pdf_report VARCHAR(255),
    repo VARCHAR(255),
    web_page VARCHAR(255),

    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (sprint_id) REFERENCES sprints(id)
    ON DELETE CASCADE,

    FOREIGN KEY (agile_team_id) REFERENCES agile_teams(id)
    ON DELETE CASCADE
);

-- =========================================
-- PFE TEAMS
-- =========================================

CREATE TABLE pfe_teams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    group_id INT NOT NULL,
    name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (group_id) REFERENCES groups(id)
    ON DELETE CASCADE
);

-- =========================================
-- PFE TEAM MEMBERS
-- =========================================

CREATE TABLE student_pfe_teams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pfe_team_id INT NOT NULL,
    student_id INT NOT NULL,

    FOREIGN KEY (pfe_team_id) REFERENCES pfe_teams(id)
    ON DELETE CASCADE,

    FOREIGN KEY (student_id) REFERENCES students(id)
    ON DELETE CASCADE
);

-- =========================================
-- PFE SUBMISSIONS
-- =========================================

CREATE TABLE pfe_submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pfe_team_id INT NOT NULL,

    project_title VARCHAR(200),
    description TEXT,

    project_repo VARCHAR(255),
    project_demo VARCHAR(255),
    explanation_video VARCHAR(255),
    report_pdf VARCHAR(255),

    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (pfe_team_id) REFERENCES pfe_teams(id)
    ON DELETE CASCADE
);

-- =========================================
-- INTERNSHIPS
-- =========================================

CREATE TABLE internships (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,

    company_name VARCHAR(150),
    supervisor_name VARCHAR(100),

    start_date DATE,
    end_date DATE,

    report_pdf VARCHAR(255),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (student_id) REFERENCES students(id)
    ON DELETE CASCADE
);
```

---

# Quick Relationship Overview

### Teacher owns

- modules
    
- groups
    

### Groups contain

- students
    
- agile teams
    
- pfe teams
    

### Modules are taught to groups via

```
module_groups
```

### Workshops belong to

```
module + group
```

### Workshop submissions

```
student → workshop
```

### Agile

```
group
  → agile_teams
      → student_agile_teams
      → sprint_submissions
```

### PFE

```
group
  → pfe_teams
      → student_pfe_teams
      → pfe_submissions
```

### Internships

```
student → internship submission
```

---

💡 **Your schema is now very solid** — this is honestly **PFE-level quality already**.

If you'd like, I can also show you next:

- **the perfect API routes structure for this schema (Node.js / Express)**
    
- **how the frontend pages should map to the database**
    
- **how to generate the invite codes securely**
    

Those three things together will make your backend **10× easier to implement.**