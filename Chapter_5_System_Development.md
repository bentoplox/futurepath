# Chapter 5: System Development

This chapter details the technical implementation, user interface structures, and underlying architectural complexities of FuturePath (a Career Advisory & Analytics System). It discusses the front-end design, back-end API construction, database design, and key algorithms that support the application's core features.

---

## 5.1 Technical Implementation

### 5.1.1 Front-End Development (React.js, State Management, UI Components)

The client application is implemented using React.js (JavaScript XML syntax) to construct a responsive, component-driven Single Page Application (SPA). The interface is designed around modular, reusable UI components that manage distinct responsibilities, preventing duplicate rendering logic and isolating state updates.

#### 1. Core Component Hierarchy
The component architecture is structured under the `src/components/` directory:
*   **Routing and Shell Configuration ([App.jsx](file:///c:/Users/User/OneDrive/Attachments/3rd%20Year%20Degree/FYP1/futurepath/src/App.jsx))**: Serves as the application entry point. It manages routing states, user authorization redirection, and navigation view transitions.
*   **Stateful Navigation ([NavigationBar.jsx](file:///c:/Users/User/OneDrive/Attachments/3rd%20Year%20Degree/FYP1/futurepath/src/components/NavigationBar.jsx))**: Renders responsive top navigation links and profiles, handling click transitions between different dashboards and views.
*   **Student Hub ([Dashboard.jsx](file:///c:/Users/User/OneDrive/Attachments/3rd%20Year%20Degree/FYP1/futurepath/src/components/dashboard/Dashboard.jsx))**: Orchestrates the landing area for authenticated students, displaying registered career pathways, overall skills progress indicators, and custom recommendations.
*   **Career Enrollment Panel ([CareerInput.jsx](file:///c:/Users/User/OneDrive/Attachments/3rd%20Year%20Degree/FYP1/futurepath/src/components/roadmap/CareerInput.jsx))**: Facilitates career pathway discovery by providing students with searchable lists of career tracks and an enrollment trigger.
*   **Visual Pathway Display ([RoadmapDisplay.jsx](file:///c:/Users/User/OneDrive/Attachments/3rd%20Year%20Degree/FYP1/futurepath/src/components/roadmap/RoadmapDisplay.jsx))**: Maps structured lists of milestone steps for a selected career. It controls progress record toggling, verified materials presentation, and exam triggers.
*   **Skill Nodes ([SkillCard.jsx](file:///c:/Users/User/OneDrive/Attachments/3rd%20Year%20Degree/FYP1/futurepath/src/components/roadmap/SkillCard.jsx))**: Individual components that represent core competencies within a roadmap. They toggle sub-lists of learning materials and house the "Validate Skill" assessment hooks.
*   **Interactive Grader ([QuizModal.jsx](file:///c:/Users/User/OneDrive/Attachments/3rd%20Year%20Degree/FYP1/futurepath/src/components/roadmap/QuizModal.jsx))**: Renders assessment questions, manages local answer selections, communicates results to the grading engine, and shows question review layouts.
*   **Alumni Portal ([AlumniDashboard.jsx](file:///c:/Users/User/OneDrive/Attachments/3rd%20Year%20Degree/FYP1/futurepath/src/components/alumnihub/AlumniDashboard.jsx))**: Contains entry interfaces for post-graduation employability surveys and allows alumni to publish jobs, internships, or comments.
*   **Admin Console ([AdminDashboard.jsx](file:///c:/Users/User/OneDrive/Attachments/3rd%20Year%20Degree/FYP1/futurepath/src/components/dashboard/AdminDashboard.jsx))**: Renders administrative tooling tabs: analytics scorecards, curriculum generators, quality assurance feeds, and moderation lists.

```
       [ App.jsx ]  <--- manages view routing and Auth Context
            |
    +-------+-------+-------------------------+
    |               |                         |
[Student]        [Alumni]                  [Admin]
    |               |                         |
    |-- NavigationBar                         |-- Executive Scorecard
    |-- Dashboard                             |-- PathwayList / Curation
    |-- CareerInput (Enrollment)              |-- AIFacultyAdvisor
    |-- RoadmapDisplay                        |-- QuizManager / ResourceManager
    |   |-- SkillCard                         |-- AdminQualityControl
    |   |-- QuizModal (Smart Grader)          +-- StudentJobBoard (Moderation)
    |-- StudentJobBoard (Discussion Feed)
    |-- EmployabilityDashboard (Survey Analytics)
    +-- SkillGapInput (Gaps feedback)
```

#### 2. State Management and Persistence
Global application state is managed using the React Context API via the `AuthProvider` component defined in [AuthContext.jsx](file:///c:/Users/User/OneDrive/Attachments/3rd%20Year%20Degree/FYP1/futurepath/src/context/AuthContext.jsx). This provider exposes authentication tokens, the current user identity object, and helper functions (`login`, `register`, `logout`) to the entire component tree.

```javascript
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  ...
  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
```

To maintain state across page refreshes, critical navigation records are synchronized with the browser's session storage. Local variables are saved via the React `useEffect` Hook in [App.jsx](file:///c:/Users/User/OneDrive/Attachments/3rd%20Year%20Degree/FYP1/futurepath/src/App.jsx):
*   `activeTab` stores the active view state (e.g., `'dashboard'`, `'roadmap'`, `'student_alumni'`).
*   `selectedCareerId` tracks the current active career roadmap ID.

Upon user logout, local storage values are wiped cleanly via a custom cleanup hook, resetting the app to default landing states.

#### 3. Styling Paradigm
UI styling is implemented using Vanilla CSS inline objects stored under [styles.js](file:///c:/Users/User/OneDrive/Attachments/3rd%20Year%20Degree/FYP1/futurepath/src/styles/styles.js) and standard stylesheets ([App.css](file:///c:/Users/User/OneDrive/Attachments/3rd%20Year%20Degree/FYP1/futurepath/src/App.css)). Inline CSS blocks ensure stylesheet isolation and modular control over components, preventing cascading class conflicts. It also facilitates dynamic style injections, such as calculating progress bar percentages and applying variable color-coded indicators.

---

### 5.1.2 Back-End Development (Python, Flask, Handling Requests)

The back-end server is built on a Python-Flask framework. The system architecture utilizes modular routing, where request handling functions are grouped into discrete files (Blueprints) and registered at the application bootstrap.

#### 1. Modular Blueprint Architecture
The application bootstrap file [app.py](file:///c:/Users/User/OneDrive/Attachments/3rd%20Year%20Degree/FYP1/futurepath/backend/app.py) configures Cross-Origin Resource Sharing (CORS) to authorize client requests and registers the following blueprints:

```python
app = Flask(__name__)
CORS(app)

app.register_blueprint(student_bp)
app.register_blueprint(admin_bp)
app.register_blueprint(ai_bp)
app.register_blueprint(alumni_bp)
app.register_blueprint(quality_bp)
app.register_blueprint(quiz_bp)
app.register_blueprint(workshop_bp)
app.register_blueprint(discussion_bp)
```

Each blueprint isolates specific API routes:
*   `student_bp` ([student_routes.py](file:///c:/Users/User/OneDrive/Attachments/3rd%20Year%20Degree/FYP1/futurepath/backend/routes/student_routes.py)): Exposes endpoints for pathway enrollment, roadmap steps retrieval, progress updates, and quiz submissions.
*   `admin_bp` ([admin_routes.py](file:///c:/Users/User/OneDrive/Attachments/3rd%20Year%20Degree/FYP1/futurepath/backend/routes/admin_routes.py)): Exposes routes for pathway deletion, manual skill insertion, step reordering, and data telemetry.
*   `ai_bp` ([ai_routes.py](file:///c:/Users/User/OneDrive/Attachments/3rd%20Year%20Degree/FYP1/futurepath/backend/routes/ai_routes.py)): Houses routes for drafting curriculum roadmaps and quiz questions using language models.
*   `alumni_bp` ([alumni_routes.py](file:///c:/Users/User/OneDrive/Attachments/3rd%20Year%20Degree/FYP1/futurepath/backend/routes/alumni_routes.py)): Handles profile surveys, tracer statistics, and FSKTM-wide market insight calculations.
*   `quality_bp` ([quality_routes.py](file:///c:/Users/User/OneDrive/Attachments/3rd%20Year%20Degree/FYP1/futurepath/backend/routes/quality_routes.py)): Directs crowdsourced feedback submissions, administrative status toggling, and review aggregations.
*   `quiz_bp` ([quiz_routes.py](file:///c:/Users/User/OneDrive/Attachments/3rd%20Year%20Degree/FYP1/futurepath/backend/routes/quiz_routes.py)): Manages assessment questions, rating upvotes/downvotes, and student voting history records.
*   `workshop_bp` ([workshop_routes.py](file:///c:/Users/User/OneDrive/Attachments/3rd%20Year%20Degree/FYP1/futurepath/backend/routes/workshop_routes.py)): Performs AI analysis of student failure telemetry, providing recommended learning interventions.
*   `discussion_bp` ([discussion_routes.py](file:///c:/Users/User/OneDrive/Attachments/3rd%20Year%20Degree/FYP1/futurepath/backend/routes/discussion_routes.py)): Manages discussion forums, jobs/internships pipelines, comment sub-trees, and bookmark favorites.

#### 2. Request Processing Flow
When an API request is received, the Flask application extracts parameters from the HTTP request structure. Path parameters, queries (`request.args`), and JSON payloads (`request.json`) are validated before executing queries. Responses are returned in structured JSON format with appropriate status codes (e.g., `200 OK` for successful fetches, `201 Created` for resource creation, and `403 Forbidden` or `500 Internal Server Error` for execution errors).

---

## 5.2 User Interface and User Experience

### 5.2.1 Desktop Interface (Dashboards, Roadmap Views, Admin Heatmaps, Alumni Hub)

The system features customized dashboard interfaces mapped to specific user roles to ensure clean layouts and optimized user flows.

#### 1. Student Dashboard and Roadmap Views
The student interface presents active career roadmaps in a step-by-step tree structure. Each step displays a list of recommended resources categorized by provider and cost type. Active steps display checkmarks once completed, while future steps are visual guides to direct progress. Selecting a step shows the option to "Validate Skill," opening a quiz modal that evaluates candidate capability before granting step completion.

#### 2. Alumni Hub and Mentorship Hub
The Alumni Hub dashboard ([AlumniDashboard.jsx](file:///c:/Users/User/OneDrive/Attachments/3rd%20Year%20Degree/FYP1/futurepath/src/components/alumnihub/AlumniDashboard.jsx)) displays career tracer cards where graduates can toggle their employment visibility, log salary figures, and post career openings. The forum displays cards sorted by type, featuring specialized ribbons for jobs and internships. Students can bookmark postings, view comments, and click verified application links directly.

#### 3. Administrative Heatmap Interface
The skills matrix renders an executive dashboard representing FSKTM student proficiency. Administrators can select active paths to view academic cohorts (Years 1 to 4) mapped against core syllabus competencies. The matrix cells change color dynamically depending on student test score averages. It also displays the total volume of student evaluations within each cell, indicating the size of the data pool.

---

## 5.3 System Complexity

### 5.3.1 Database Architecture & Supabase Integration (PostgreSQL Schema, Data Relationships, and Cascade Deletions)

FuturePath integrates with a Supabase PostgreSQL instance. The schema is normalized to preserve transactional consistency and enforce referential integrity across the users, curriculum, progress, and QA feedback tables.

#### 1. Entity Relationship (ER) Schema Mapping
The data model is structured around several primary tables:
*   `users`: Tracks registered users, linking authentication identities (`user_id` mapped to Supabase auth) to application profiles.
*   `career`: Houses the master directory of career paths (e.g., "Data Scientist", "Cloud Architect") along with lifecycle status.
*   `skill`: Registers individual competencies, mapping their description and a slug-like `concept_tag` for educational resource associations.
*   `roadmap_step`: Serves as a junction table between careers and skills, recording sequence indexes (`step_order`) to form linear curricula.
*   `learning_resource` & `verified_resources`: Store materials mapped to skills via concept tags, tracking provider information, access links, and cost types.
*   `quiz`: Holds 3-question MCQ banks mapped to skills, detailing correct answer alternatives and community vote counts.
*   `quiz_result`: Telemetry tracker logging student scores on skill validation tests.
*   `roadmap`: Records student enrollment in career paths.
*   `progress_record`: Junction table mapping users to steps, tracking completed curriculum milestones.
*   `student_skill_gaps`: Stores subjective feedback reported by students regarding curriculum gaps.
*   `alumni_career_stats`: Holds details from tracer surveys (salaries, employers, roles) to calculate FSKTM-wide insights.

```
 [users] 1 ------ 0..* [roadmap] 0..* ------ 1 [career]
    |                                            |
    |                                            | 1
    |                                            |
    |                                          0..*
    |                                     [roadmap_step] 0..* ------ 1 [skill]
    |                                            |                       |
    |                                            |                       | 1
    |                                            |                       |
    |                                            |                     0..*
    | 1                                        0..*                 [learning_resource]
    |                                   [progress_record]           [verified_resources]
    |                                                               [quiz]
    +------- 0..* [quiz_result] 0..* -------------------------------+
    |
    +------- 0..* [alumni_career_stats]
    |
    +------- 0..* [alumni_posts]
```

#### 2. Cascade Deletion Logic and Referential Integrity
To prevent orphan database records, cascade deletion logic is enforced at both the schema foreign key definitions and backend API routing operations. For example, deleting a career path triggers a cascade delete operation to clean up all related user records and steps:

```python
# Coordinated Cascade Handler in backend/routes/admin_routes.py
@admin_bp.route('/api/admin/career/delete/<int:career_id>', methods=['DELETE'])
def admin_delete_career(career_id):
    try:
        # 1. Select steps and linked skills
        steps = supabase.table('roadmap_step').select('step_id, skill_id').eq('career_id', career_id).execute()
        step_ids = [s['step_id'] for s in steps.data]
        skill_ids = [s['skill_id'] for s in steps.data]
        
        # 2. Delete progress records linking to these steps
        if step_ids: 
            supabase.table('progress_record').delete().in_('step_id', step_ids).execute()
            
        # 3. Delete roadmap enrollments
        supabase.table('roadmap').delete().eq('career_id', career_id).execute()
        
        # 4. Remove step junctions
        supabase.table('roadmap_step').delete().eq('career_id', career_id).execute()
        
        # 5. Remove quizzes, results, and skills
        if skill_ids:
            supabase.table('quiz').delete().in_('skill_id', skill_ids).execute()
            supabase.table('quiz_result').delete().in_('skill_id', skill_ids).execute()
            supabase.table('skill').delete().in_('skill_id', skill_ids).execute()
            
        # 6. Delete base career record
        supabase.table('career').delete().eq('career_id', career_id).execute()
        return jsonify({"success": True})
```

This coordinated approach ensures clean database state updates, preventing invalid foreign key queries and maintaining schema integrity.

---

### 5.3.2 Data Aggregation & Telemetry Processing Pipeline (Market Insights and Cohort Quiz Math)

The backend processes student and alumni data to calculate salary metrics and student performance averages.

#### 1. FSKTM Market Insights Aggregation
The endpoint `/api/market/insights` in [alumni_routes.py](file:///c:/Users/User/OneDrive/Attachments/3rd%20Year%20Degree/FYP1/futurepath/backend/routes/alumni_routes.py) compiles early-career salary data. It runs a select query to fetch public tracer surveys:

```python
res = supabase.table('alumni_career_stats').select('*, users(programme)').eq('is_public', True).execute()
```

The records are aggregated in memory using a hash map grouped by FSKTM degree programs (e.g., Software Engineering, Data Science, Cybersecurity), alongside an overall faculty-wide bucket:

$$\text{program\_insights}[\text{PROGRAM}] = \{\text{employers}, \text{internships}, \text{roles}, \text{intern\_roles}\}$$

The algorithm computes average salaries for each employer and job role using the formula:

$$\text{Avg Salary} = \text{round}\left( \frac{\sum_{i=1}^{N} \text{Salary}_i}{N} \right)$$

where $N$ represents the count of public profiles reporting a salary. Aggregated entries are sorted by employment count, and the top five employers and roles for each program are returned to the frontend.

#### 2. Cohort Quiz Telemetry Aggregation
The admin analytics dashboard runs calculations on student test scores via `/api/admin/heatmap` in [admin_routes.py](file:///c:/Users/User/OneDrive/Attachments/3rd%20Year%20Degree/FYP1/futurepath/backend/routes/admin_routes.py). The pipeline joins curriculum roadmaps with user results:

```python
links_res = supabase.table('roadmap_step').select('skill_id, skill(skill_name), career(career_id, career_name, status)').execute()
results_res = supabase.table('quiz_result').select('score, skill_id, users(academic_year)').execute()
```

The scores are aggregated by mapping the student's academic year string (parsed into categories `y1` to `y4`) to the corresponding skill:

```python
# String sanitization & key mapping
raw_year = str(entry['users']['academic_year']).lower().replace('year', '').strip()
if raw_year in ['1', '2', '3', '4']:
    year_key = f"y{raw_year}"
    aggregation[skill_id][year_key].append(entry['score'])
```

The system calculates the cohort average for each year-group cell using the formula:

$$\mu_{\text{Year } i} = \text{round}\left( \frac{\sum_{j=1}^{C} \text{Score}_j}{C} \right)$$

where $C$ is the count of test attempts for that cell (`yX_count`). If no students have attempted a quiz, the average defaults to zero.

---

### 5.3.3 Dynamic Skill Gap Heatmap Implementation (Matrix Generation and UI Color Mapping)

The admin analytics matrix displays student performance averages across FSKTM.

#### 1. Dynamic Matrix Generation
The frontend page [AdminDashboard.jsx](file:///c:/Users/User/OneDrive/Attachments/3rd Year Degree/FYP1/futurepath/src/components/dashboard/AdminDashboard.jsx) receives the telemetry payload and groups records by career pathway using set operations:

```javascript
const uniqueCareers = [...new Set(skillHeatmapData.map(s => s.career_name))];
```

The interface loops through this list to render grids for each career. The grid has five columns: the leftmost lists the skill name, followed by four columns representing academic years Y1 to Y4.

#### 2. Color-Coded Rendering
Proficiency cell colors are mapped dynamically according to test score thresholds:

```javascript
const getHeatmapColor = (score) => {
  if (score === 0) return '#f3f4f6'; // Gray: No data registered
  if (score < 50) return '#fef2f2';  // Red: Critical skills gap
  if (score < 75) return '#fff7ed';  // Orange: Moderate proficiency
  return '#ecfdf5';                   // Green: Proficient
};

const getHeatmapTextColor = (score) => {
  if (score === 0) return '#94a3b8';
  if (score < 50) return '#991b1b';
  if (score < 75) return '#9a3412';
  return '#065f46';
};
```

This mapping highlights cohort distress points, allowing administrators to spot when a skill average drops below 50% for a particular year-group.

---

### 5.3.4 Zero-Cold-Start AI Curriculum Synthesis (LLM Integration, Prompting, and JSON Constraints)

To generate structured roadmaps for new career paths, FuturePath uses LLM synthesis. This allows the system to build structured roadmaps without needing pre-existing template data.

#### 1. Orchestration Architecture
The endpoint `/api/admin/draft/steps` in [ai_routes.py](file:///c:/Users/User/OneDrive/Attachments/3rd%20Year%20Degree/FYP1/futurepath/backend/routes/ai_routes.py) coordinates calls to the AI service defined in [ai_service.py](file:///c:/Users/User/OneDrive/Attachments/3rd%20Year%20Degree/FYP1/futurepath/backend/services/ai_service.py). This service wraps the LangChain library to call external APIs (Gemini 2.0 Flash or Llama-3.3 70B) based on configuration settings:

```python
# backend/services/ai_service.py
if AI_PROVIDER == "gemini":
    llm = ChatGoogleGenerativeAI(model=GEMINI_MODEL, google_api_key=os.getenv("GEMINI_API_KEY"))
    res = llm.invoke(prompt)
    return res.content
```

#### 2. Resource-Aware Prompt Injection
To avoid creating redundant resource entries, the endpoint queries existing learning materials from the database first:

```python
verified_tags_res = supabase.table('verified_resources').select('concept_tag').execute()
available_tags = list(set([r['concept_tag'] for r in verified_tags_res.data]))
tags_list_str = ", ".join(available_tags)
```

This list of tags is injected directly into the LLM prompt as context. The LLM is instructed to reuse these exact tags if a generated step matches an existing database category, preventing duplicate learning tracks.

#### 3. Output Schema Enforcement
To prevent the model from generating conversational text or unstructured outputs, the system uses formatting rules in the prompt and parses the results:
*   **Prompt Rules**: The prompt specifies a strict JSON output structure:

```json
{
    "description": "Professional summary",
    "steps": [
        {
            "skill_name": "Name",
            "concept_tag": "specific-tag",
            "category": "Technical",
            "description": "Explanation"
        }
    ]
}
```

*   **Sanitization and Parsing**: The helper function `clean_json` processes the returned string to strip out markdown blocks (` ```json ... ``` `) before the JSON string is parsed and stored in the database:

```python
def clean_json(raw_text):
    text = raw_text.strip()
    if text.startswith("```"):
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
    return text.strip()
```

---

### 5.3.5 Automated Assessment Generation & Grading Engine (Two-Step AI Generation, Passing Thresholds, and Progress Blocking)

#### 1. Two-Step Generation Flow
To generate curricula, the system splits content synthesis into two distinct API requests. This isolates processing, prevents timeout issues, and allows administrators to review steps and quizzes independently:
1.  **Roadmap Drafting**: Generates roadmap steps, skill categories, and concept tags ([ai_routes.py:L8-49](file:///c:/Users/User/OneDrive/Attachments/3rd%20Year%20Degree/FYP1/futurepath/backend/routes/ai_routes.py#L8-49)).
2.  **Quiz Generation**: Uses the generated skill list to draft three multiple-choice questions for each competency:

```python
# backend/routes/ai_routes.py:L51-83
@ai_bp.route('/api/admin/draft/quizzes', methods=['POST'])
def draft_quizzes():
    skills = request.json.get('skills', [])
    prompt = f"Generate 3 MCQs for each of these skills: {json.dumps(skills)}..."
```

#### 2. Smart Parsing and Grading Engine
The frontend assessment grader in [QuizModal.jsx](file:///c:/Users/User/OneDrive/Attachments/3rd%20Year%20Degree/FYP1/futurepath/src/components/roadmap/QuizModal.jsx) handles variations in the format of correct answers returned by the LLM (e.g., raw index letters, letter periods, or full strings):

```javascript
const isCorrectMatch = (optionText, optionIndex, aiCorrectAnswer) => {
  if (!aiCorrectAnswer) return false;
  const target = String(aiCorrectAnswer).trim().toLowerCase();
  const opt = String(optionText).trim().toLowerCase();
  const letter = String.fromCharCode(97 + optionIndex); // 0->'a', 1->'b'

  if (opt === target) return true; // Exact match
  if (target === letter || target === `${letter}.`) return true; // Letter match
  if (target.includes(opt) || opt.includes(target)) return true; // Partial match
  return false;
};
```

#### 3. Passing Threshold and Progress Routing
To validate a skill, the grading engine evaluates the user's answers and computes a percentage score:

$$\text{Score} = \text{round}\left( \frac{\text{Correct Answers}}{\text{Total Questions}} \times 100 \right)$$

*   **Skill Validation**: Individual skill quizzes require a score of $\ge 66\%$ to pass. If the student passes, the frontend triggers the completion handler to unlock the next roadmap step. If the student fails, progress is blocked, the step remains incomplete, and the student is prompted to review the material and try again later.
*   **Capstone Certification**: When a student completes all steps on a roadmap, they unlock the Capstone Exam. This exam extracts a random pool of 20 questions covering all skills on the path. Passing the exam ($\ge 66\%$) calls the `/api/submit-quiz` endpoint, which updates the `roadmap` status to `'completed'` and issues a graduation certificate.

---

### 5.3.6 Alumni Data Engine & Mentorship Hub (Survey Lifecycle, Privacy Toggles, and RBAC)

#### 1. Job Posting Lifecycle
The endpoint `/api/discussion/posts` in [discussion_routes.py](file:///c:/Users/User/OneDrive/Attachments/3rd%20Year%20Degree/FYP1/futurepath/backend/routes/discussion_routes.py) manages job and internship submissions. It splits postings into two paths to balance rapid community updates with quality control:

```python
post_type = data.get('post_type')
if post_type in ['job', 'internship']:
    status = 'pending' # Requires administrator approval before publication
else:
    status = 'approved' # Mentorship and general discussions publish immediately
```

#### 2. Privacy Toggles
To protect salary information in the public tracer feed, the database schema supports dynamic privacy checks:
*   Surveys submit detailed salary figures with an visibility toggle (`is_public = True`).
*   Profile entries in the `users` table contain a `show_workplace` toggle.
*   When fetching feeds, queries resolve relationships and mask employer names or titles if the visibility flags are set to false:

```python
# Resilient relationship join in discussion_routes.py
res = supabase.table('alumni_posts')\
    .select('*, users!fk_alumni_posts_author(name, current_role, show_workplace)')\
    .eq('status', 'approved')\
    .execute()
```

#### 3. Role-Based Access Control (RBAC)
Database policies and API handlers restrict actions based on user roles. For example, deletion endpoints verify the request author:

```python
# Deletion check in discussion_routes.py
post_res = supabase.table('alumni_posts').select('author_id').eq('id', post_id).execute()
if post_res.data[0]['author_id'] != user_id:
    return jsonify({"success": False, "error": "Unauthorized delete attempt"}), 403
```

This prevents IDOR (Insecure Direct Object Reference) vulnerabilities, ensuring users can only modify their own posts.

---

### 5.3.7 API Architecture & System Orchestration (RESTful Design, React-Flask Communication, and Supabase Auth)

#### 1. Communication Flow
Communication follows a RESTful design. The React frontend interacts with the Flask backend using HTTP requests pointing to `API_BASE_URL` ([apiConfig.js](file:///c:/Users/User/OneDrive/Attachments/3rd%20Year%20Degree/FYP1/futurepath/src/apiConfig.js)):

```
[React Client SPA] 
       | (REST HTTP Fetch - JSON Payloads)
       v
[Flask Modular Blueprint Router] 
       | (CRUD operations via Python SDK Client)
       v
[Supabase Backend Service Layer]
```

#### 2. Authentication Integration
User sessions are managed through a dual-key authentication flow:
1.  **Supabase Auth (SignUp/SignIn)**: The frontend connects directly to Supabase Auth to handle user registration, session tokens, and passwords.
2.  **Public Database Sync**: Once a user registers, the frontend triggers a database insert to write the user's profile details and application role (student, alumni, or admin) to the public `users` table, linking it to the Supabase authentication UUID:

```javascript
// Sync auth records to user profile tables in AuthContext.jsx
const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
if (authData.user) {
  const { error: dbError } = await supabase.from('users').insert([{
    user_id: authData.user.id,
    email: email,
    name: name,
    role: role,
    programme: role === 'student' ? programme : null,
    status: 'active'
  }]);
}
```

This dual-layer flow ensures user sessions are authenticated securely while keeping profile information easy to query.

---

### 5.3.8 Remote Procedure Call (RPC) Roadmap Manipulation & Normalization Engine

Modifying curriculum roadmaps directly in a relational database can lead to sequence gaps and constraint violations. To resolve this, FuturePath uses database-level procedures to manage step reordering, skill additions, and deletions.

#### 1. Smart Reordering Procedures
When an administrator inserts or deletes a skill, the backend calls remote database procedures:
*   **Step Insertion**: Calling the `shift_roadmap_steps_up` procedure shifts existing steps upward to make room for the new competency:

```python
# Calling insert shifts in admin_routes.py
supabase.rpc('shift_roadmap_steps_up', {'p_career_id': c_id, 'p_start_step': target_step}).execute()
```

*   **Step Deletion**: When a skill is removed, the `shift_roadmap_steps_down` procedure pulls subsequent steps down to fill the gap.

#### 2. Index Normalization
To prevent duplicate step numbers, swapping two steps uses a temporary placeholder value before re-indexing:

```python
# Swapping step sequence in admin_routes.py
supabase.table('roadmap_step').update({"step_order": 999}).eq('career_id', c_id).eq('step_order', new_order).execute()
supabase.table('roadmap_step').update({"step_order": new_order}).eq('career_id', c_id).eq('skill_id', s_id).execute()
supabase.table('roadmap_step').update({"step_order": current_order}).eq('career_id', c_id).eq('step_order', 999).execute()

# Normalize step order indexes to ensure a clean sequence (1, 2, 3, etc.)
supabase.rpc('normalize_roadmap', {'p_career_id': c_id}).execute()
```

The database procedure `normalize_roadmap` loops through the steps for the career and updates the sequence indexes to ensure they form a clean, consecutive series starting from 1.

---

### 5.3.9 Crowdsourced Content Curation & Peer-Review Quality Control Loop

To keep learning materials accurate, FuturePath implements a quality control system that leverages student and alumni feedback.

```
[Student / Alumni User] 
       | (Submits feedback on content quality / errors)
       v
[content_feedback Table] (Saved as "pending")
       |
       v
[Admin Quality Control Dashboard] 
       |-- Separates reviews:
       |   |-- Alumni Insights (Industry recommendations)
       |   +-- Student QA Reports (Syllabus errors & bug flags)
       |
       +--> Admin Action: Resolves flags and updates roadmap resources
```

#### 1. Feedback Submission
Users can flag content errors, outdated links, or curriculum gaps:

```python
# Feedback capture handler in quality_routes.py
@quality_bp.route('/api/quality/feedback', methods=['POST'])
def submit_feedback():
    data = request.json
    payload = {
        "user_id": data['user_id'],
        "user_role": data['user_role'],
        "target_type": data['target_type'],
        "feedback_type": data['feedback_type'],
        "suggested_alternative_text": data.get('suggested_alternative_text'),
        "status": "pending"
    }
    res = supabase.table('content_feedback').insert(payload).execute()
```

#### 2. Administrative Review and Resolution
The feedback is displayed in the admin interface, categorized by user role:
*   **Alumni Insights**: Highlights industry recommendations to keep curriculum tracks aligned with current market needs.
*   **Student QA Reports**: Focuses on syllabus errors, broken resources, or quiz questions flagged as incorrect.

Administrators can update materials based on these insights and toggle the feedback status to `'reviewed'` via the endpoint `/api/admin/quality-control/resolve/<id>` to resolve the flag.
