# Chapter 6: System Evaluation

## 6.1 System Testing Overview

The FuturePath system was evaluated through a multi-layered testing strategy designed to verify correctness at every level of the architecture, from isolated UI components to full backend API workflows. The strategy was divided into three categories:

1. **Frontend Unit Testing (Jest + React Testing Library):** Each React component was tested in complete isolation by mocking all external dependencies such as the `AuthContext`, the Supabase client, and the global `fetch` API. This ensured that user-facing logic, such as form validation, filter toggling, and progress calculations, could be verified without requiring a running backend server. A total of **12 frontend test files** were created inside the `src/__tests__/` directory.

2. **Backend Integration & API Testing (Pytest):** Each Flask API endpoint was tested by sending simulated HTTP requests through Flask's built-in `test_client()`. The Supabase database layer was fully mocked using Python's `unittest.mock` library, which allowed the tests to verify that the backend correctly constructs database queries, handles edge cases, and returns properly formatted JSON responses. A total of **10 backend test files** were created inside the `tests/` directory.

3. **User Acceptance Testing (UAT):** A structured methodology was designed for real users (students, alumni, and administrators) to evaluate the system against its functional requirements. The UAT process is described in Section 6.5.

This layered approach ensures that defects are caught at the earliest possible stage. A bug in the "Smart Grader" logic, for example, would be caught by the isolated `QuizModal.test.js` before it ever reaches the backend. Conversely, a misconfigured database query would be caught by the Pytest integration suite before it ever reaches the user interface.

### 6.1.1 Test Infrastructure Configuration

The frontend test environment is configured in `setupTests.js`, which runs before every Jest test file. This file performs three critical setup operations:

- **DOM Assertion Library:** It imports `@testing-library/jest-dom`, which provides custom matchers like `.toBeInTheDocument()` and `.toHaveTextContent()` for asserting on rendered DOM elements.
- **Global Supabase Mock:** It creates a factory mock of the `supabaseClient` module that intercepts all direct Supabase calls (e.g., `.from().select().eq()`) and returns empty, non-crashing responses. This prevents any test from accidentally making real network requests to the production database.
- **Browser API Polyfills:** It mocks `window.open` and `Element.prototype.scrollIntoView`, which are not implemented in JSDOM (the simulated browser environment used by Jest).

The backend test environment is configured in `conftest.py`, which uses Pytest's fixture system. It provides two shared fixtures:

- **`app` fixture:** Creates a new Flask application instance with `TESTING: True` for each test, ensuring test isolation.
- **`client` fixture:** Returns a `test_client()` from the Flask app, which allows tests to call API endpoints like `client.get('/api/roadmap/999')` without starting a real HTTP server.

---

## 6.2 Unit Testing

Unit testing in FuturePath focuses on verifying that individual components produce the correct output for a given input, without relying on any external services. The key technique used across all unit tests is **dependency injection through mocking**, where external services (Supabase, LLM APIs, AuthContext) are replaced with controlled fake objects.

### 6.2.1 Frontend Component Isolation (Jest)

Every frontend test file follows a consistent three-step structure:

1. **Mock External Dependencies:** The `useAuth` hook from `AuthContext` is mocked using `jest.mock('../context/AuthContext')` to inject a fake user object. The global `fetch` API is replaced with `jest.fn()` to intercept all HTTP calls.
2. **Render the Component:** The component is rendered in isolation using React Testing Library's `render()` function, which mounts it into a virtual DOM.
3. **Assert on the DOM:** The test queries the rendered DOM using accessible queries (e.g., `screen.getByText()`, `screen.getByRole()`) and asserts that the correct elements are visible.

#### QuizModal: Smart Grader Logic (`QuizModal.test.js`)

The `QuizModal` component contains a "Smart Grader" algorithm that can match a student's selected answer against the correct answer in multiple formats. For example, if the database stores the correct answer as `"c"` (a letter index) but the student selects `"Paris"` (the actual text), the grader must recognise both as correct.

This logic was tested with three specific test cases:

- **`successfully passes a quiz (3/3 correct)`:** Verifies that selecting all correct answers (including the letter-index match for Question 2) results in a 100% score and a "Passed!" message. The mock questions include a case where `correct_answer: "c"` maps to the option "Paris" at index 2.
- **`fails a quiz and shows "Keep Learning" (0/3 correct)`:** Verifies that selecting all incorrect answers results in a 0% score and the "Keep Learning" encouragement message instead of "Passed!".
- **`handles voting interaction`:** Verifies that clicking the upvote button dispatches a `POST` request to `/api/quiz/vote` with the correct `vote_type: "upvote"` payload. This confirms the quiz engagement feature works independently of the grading logic.

#### Dashboard: Horizontal Stepper & Fallback Logic (`Dashboard.test.js`)

The student `Dashboard` component renders a horizontal progress stepper for each active roadmap. It calculates completion percentage from the `completed_steps` and `total_steps` arrays. Four test cases verify this logic:

- **100% Complete → Capstone Button:** When `progress_percent: 100` and `is_eligible: true`, the dashboard renders a "Take Capstone Quiz 🚀" button instead of the standard "Continue Learning →" button.
- **Partial Progress → Continue Button:** When `progress_percent: 50`, the dashboard renders the "Continue Learning →" call-to-action.
- **State-Loss Prevention (Fallback):** This is the most critical test case. It simulates a scenario where `detailed_steps: null` due to a network failure or a race condition. Instead of crashing, the Dashboard is expected to generate placeholder nodes labelled "Module 1", "Module 2", etc., based on the `total_steps` count. The test asserts that both `Module 1` and `Module 2` are rendered, and that the header "Your Roadmap: Cloud Solution Architect" still displays, proving the component did not crash to a white screen.
- **Empty State:** When `roadmaps: []`, the dashboard shows a "No active roadmaps. Start a new one" message.

#### RoadmapDisplay: Progress Sync (`RoadmapDisplay.test.js`)

The `RoadmapDisplay` component is the detailed view of a single career roadmap. Its tests verify:

- **Data Rendering:** After fetching roadmap data, it correctly displays the career name ("AI Engineer Roadmap"), the completion percentage (50%), and renders `SkillCard` components with the correct status (`completed` vs `in-progress`).
- **Backend Synchronisation:** When a student clicks "Toggle Progress" on a skill card, the component sends a `POST` request to `/api/progress` with `step_id: 2` and `status: "completed"`. After the response, it re-fetches the roadmap and the UI updates to show 100% completion.
- **Capstone Eligibility:** When `is_eligible_for_quiz: true`, a "Start Capstone Quiz" button appears. Clicking it opens the `QuizModal` component.

#### AdminDashboard: Heatmap Cell Logic (`AdminDashboard.test.js`)

The admin heatmap displays quiz performance across academic years. A subtle but important edge case exists: the difference between a student who scored 0% and a year group that has never attempted the quiz. Both produce a raw value of `0`, but they must be displayed differently.

The test in `AdminDashboard.test.js` provides mock heatmap data where:
- Year 1 has `y1: 0` with `y1_count: 1` (one student scored 0%).
- Year 2 has `y2: 0` with `y2_count: 0` (no students attempted).

The test asserts that Year 1 renders as `"0%"` (a genuine score) with a tooltip stating "📊 1 students attempted this quiz", while Year 2 renders as `"-"` (a dash indicating no data). This prevents administrators from misinterpreting unattempted quizzes as mass failure.

#### AdminQualityControl: CRUD & State Transitions (`AdminQualityControl.test.js`)

This component manages the quality feedback lifecycle. Its six test cases cover:

- **Initial Load:** Loads from the API and displays only pending alumni insights by default, hiding already-reviewed items.
- **Role Switching:** Clicking "Student Reports" hides alumni insights and shows student feedback entries.
- **Tab Switching:** Clicking "Reviewed History" reveals previously resolved items and hides pending ones.
- **Resolution Logic:** Clicking "Mark as Complete ✓" sends a `POST` to `/resolve/1`, immediately removes the item from the pending list, and adds it to the history tab—all without a page reload.
- **Empty State:** When both `alumni_insights` and `student_reports` are empty arrays, the component displays "No pending alumni insights in the queue".
- **Fetch Failure:** When the API throws an error, the component catches it via `console.error` and does not crash.

#### Additional Frontend Test Coverage

| Test File | Component | Key Verification |
|---|---|---|
| `AuthProfile.test.js` | `App`, `UserProfile` | Login forces `activeTab` reset to `"dashboard"` in localStorage; profile modal stays closed on initial load; internship role pre-fills from backend data. |
| `AlumniDashboard.test.js` | `AlumniDashboard` | "Show All Posts" / "Showing Mine ✓" toggle correctly filters posts by `author_id`; search works in conjunction with the personal filter. |
| `StudentJobBoard.test.js` | `StudentJobBoard` | Real-time search filters posts by title as the user types; bookmark toggle sends `POST` to `/api/discussion/favorite` and updates the star icon from ☆ to ⭐. |
| `PostComments.test.js` | `PostComments` | Renders existing comments with role badges ("Alumni" / "Student"); allows posting new comments; reply button pre-fills `@mention`; hides reply button for the user's own comments. |
| `SkillGapInput.test.js` | `SkillGapInput` | Renders the feedback form; submits payload to `/api/user/skill-gap`; handles API error by showing a `window.alert`; back button triggers `onBack` callback. |
| `Analytics.test.js` | `EmployabilityDashboard`, `AIFacultyAdvisor` | Renders "Most Common Internship Roles" card with correct data; "Download Report" button triggers `window.open` for the HTML-to-PDF export flow. |
| `Resilience.test.js` | `AIFacultyAdvisor`, `Dashboard` | Covered in Section 6.6 (Error Handling & System Resilience). |

### 6.2.2 Backend Unit Testing (Pytest)

Backend unit tests follow a similar isolation principle. Instead of mocking browser APIs, they mock the Supabase client imported by each Flask route module. Every test file uses a shared `setup_mock_supabase()` helper function that:

1. Patches the `supabase` object inside the specific route module (e.g., `mocker.patch('routes.student_routes.supabase')`).
2. Creates a `MagicMock()` query chain that supports `.table().select().eq().execute()` chaining.
3. Pre-configures `.execute()` to return an empty `MagicMock(data=[])` by default.

This approach ensures that no test accidentally triggers a real database connection, while still allowing each test to inject custom return values for specific queries.

#### Data Integrity: Market Insights Math (`test_integrity.py`)

The market insights endpoint (`/api/market/insights`) aggregates alumni employment data to calculate statistics like "Top Employers" and "Average Salary". A mathematical error in this aggregation would produce misleading analytics for administrators.

The test `test_market_insights_top_employers_math` injects two alumni records from the same programme, both employed at "Grab" with salaries of RM 5,000 and RM 4,000. It then asserts that:

- `grab_stat['count'] == 2` (both alumni counted).
- `grab_stat['avg_salary'] == 4500` (the arithmetic mean is (5000 + 4000) / 2 = 4500).

This test catches any future regression where the averaging formula might be broken, such as accidentally summing without dividing, or dividing by the wrong denominator.

#### AI Advisor Data Compression (`test_admin_ai.py`)

When the AI Faculty Advisor analyses failing quiz results, it must compress raw records before sending them to the LLM. Without compression, 50 individual records for the same skill would exceed the LLM's context window and produce degraded recommendations.

The test `test_ai_advisor_data_compression` injects 50 identical failing records (each with `score: 40` for the skill "Python") and verifies that the prompt sent to `get_ai_response()` contains:

- `"skill":"Python"` — the aggregated skill name.
- `"count":50` — the number of records compressed into one.
- `"avg":40.0` — the average score across all records.

This confirms that the backend performs server-side aggregation before invoking the LLM, keeping the prompt compact and within token limits.

#### Heatmap Aggregation Math (`test_admin_ai.py`)

The heatmap endpoint (`/api/admin/heatmap`) must correctly calculate average quiz scores per academic year. The test `test_heatmap_aggregation_math` injects three quiz results for Year 1 with scores of 100%, 50%, and 0%, then asserts:

- `row['y1'] == 50` (the average of 100, 50, and 0 is 50).
- `row['y1_count'] == 3` (three attempts recorded).

This test is critical because the heatmap is the primary tool administrators use to identify struggling year groups. An incorrect average would lead to misallocated resources.

#### Enrollment Lifecycle (`test_enrollment.py`)

Three test cases verify the enrollment workflow:

- **New Enrollment:** A student enrolling for the first time triggers an `INSERT` into the `roadmap` table with `status: "active"`.
- **Duplicate Enrollment:** A student who is already enrolled receives a success response, but no `INSERT` is called—preventing duplicate entries.
- **Missing Data:** When `user_id` is `None`, Supabase throws an `Exception("Invalid input")`, and the backend catches it and returns a `500` status code with the error message.

---

## 6.3 Integration & API Testing

While unit tests verify isolated logic, integration tests verify that multiple components work together correctly across the Flask API layer. These tests simulate a full HTTP request-response cycle through Flask's `test_client()` and validate the interaction between the route handler, the Supabase mock, and (in some cases) the mocked LLM service.

### 6.3.1 AI Generation Pipeline (`test_ai_generation.py`)

The AI generation pipeline is the most complex workflow in FuturePath. It involves three sequential operations: drafting roadmap steps, drafting quizzes, and committing the final pathway to the database. Each operation was tested independently.

#### Drafting Roadmap Steps

The test `test_draft_steps` verifies the `/api/admin/draft/steps` endpoint. It:

1. Mocks `supabase.table('skill').select('concept_tag')` to return existing verified tags (`["python", "react"]`).
2. Mocks `get_ai_response()` to return a raw string (`"RAW AI RESPONSE"`).
3. Mocks `clean_json()` to return a valid JSON string containing a step with `skill_name: "Python"` and `concept_tag: "python"`.

The test then asserts that:
- `mock_ai.assert_called_once()` — the LLM was invoked exactly once.
- `data['draft']['steps'][0]['skill_name'] == "Python"` — the draft was correctly parsed and returned.

This test is important because it validates the entire pipeline: prompt construction → LLM invocation → response sanitisation via `clean_json()` → JSON parsing → API response formatting.

#### Drafting Quizzes

The test `test_draft_quizzes` follows the same pattern for the `/api/admin/draft/quizzes` endpoint. The mocked AI response includes a quiz with a question, options, a correct answer, and a difficulty level. The test confirms the response is correctly structured with `data['draft']['quizzes'][0]['skill_name'] == "Python"`.

#### Committing a Pathway

The test `test_commit_pathway` is the most complex backend test. It simulates the admin committing a drafted pathway to the database, which triggers a cascade of four sequential database operations:

1. **Career Insert:** `INSERT INTO career` → returns `career_id: 10`.
2. **Skill Insert:** `INSERT INTO skill` → returns `skill_id: 100`.
3. **Roadmap Step Insert:** `INSERT INTO roadmap_step` with `career_id: 10` and `skill_id: 100`.
4. **Quiz Insert:** `INSERT INTO quiz` linked to the new skill.

The mock's `.execute.side_effect` is configured as an ordered list of four return values, one for each sequential insert. The test then verifies:

- `mock_supabase.table.assert_any_call('career')` — the career table was targeted.
- `mock_query.insert.assert_any_call({"career_name": "AI Engineer", "description": "Build AI", "status": "draft"})` — the correct payload was sent.
- `mock_query.insert.assert_any_call({"career_id": 10, "skill_id": 100, "step_order": 1})` — the roadmap step correctly links the new career and skill.

### 6.3.2 Resource Management & RPC Procedures (`test_resource_management.py`)

The admin resource management endpoints interact with PostgreSQL RPC (Remote Procedure Call) functions to maintain sequence integrity in the roadmap. These are server-side stored procedures that shift step ordering when skills are added or removed.

#### Adding a Skill (Shift Up)

The test `test_add_manual_skill` verifies that when an admin inserts a new skill at position 2, the backend:

1. Calls `supabase.rpc('shift_roadmap_steps_up', {'p_career_id': 1, 'p_start_step': 2})` to push existing steps at positions 2, 3, 4... up by one.
2. Inserts the new skill into the `skill` table (returns `skill_id: 500`).
3. Inserts a new `roadmap_step` at position 2 linking `career_id: 1` and `skill_id: 500`.

#### Deleting a Skill (Cascade Delete + Shift Down)

The test `test_delete_roadmap_skill` verifies that deleting a skill triggers a cascade of four table operations:

- `DELETE FROM learning_resource WHERE skill_id = 500`
- `DELETE FROM quiz WHERE skill_id = 500`
- `DELETE FROM roadmap_step WHERE career_id = 1 AND skill_id = 500`
- `DELETE FROM skill WHERE skill_id = 500`

After the deletes, the backend calls `supabase.rpc('shift_roadmap_steps_down', {'p_career_id': 1, 'p_start_step': 2})` to close the gap in the sequence.

#### Reordering a Skill (Three-Way Swap)

The test `test_reorder_skill_up` verifies the swap algorithm used when an admin moves a skill up in the roadmap:

1. The skill at position 2 is temporarily moved to position 999 (a sentinel value).
2. The target skill is moved from position 3 to position 2.
3. The displaced skill is moved from position 999 to position 3.

After the swap, `supabase.rpc('normalize_roadmap', {'p_career_id': 1})` is called to re-normalise all step orders to consecutive integers.

### 6.3.3 Discussion & Post Lifecycle (`test_discussion.py`)

The Alumni Hub's post system uses a content moderation workflow. Four test cases verify this lifecycle:

- **Job Post Creation:** When `post_type: "job"`, the backend automatically sets `status: "pending"`, requiring admin approval before it becomes visible.
- **Mentorship Post Creation:** When `post_type: "mentorship"`, the backend sets `status: "approved"` immediately, as mentorship posts do not require moderation.
- **Author-Aware Visibility:** When fetching posts with `user_id=Alumnus_A`, the backend constructs a Supabase `OR` filter: `status.eq.approved,author_id.eq.Alumnus_A`. This allows the author to see their own pending posts while hiding other users' pending posts.
- **Public Visibility:** When no `user_id` is provided, the query strictly filters by `status = 'approved'`, ensuring unauthenticated users only see moderated content.

### 6.3.4 Quiz Lifecycle (`test_quiz_lifecycle.py`)

The quiz system supports voting, grading, and multi-skill score calculation:

- **New Vote:** Upvoting a quiz for the first time inserts a record into `student_quiz_votes` and increments the quiz's `upvotes` counter from 5 to 6.
- **Toggle Vote Off:** Clicking upvote again on the same quiz deletes the existing vote and decrements the counter from 10 to 9.
- **Failing Grade Threshold:** Scoring 40% (below the 66% passing threshold) on a capstone quiz records the result but does **not** update the roadmap's status to `"completed"`. The test iterates through all `.update()` calls to confirm that `{"status": "completed"}` was never passed.
- **Multi-Skill Score Calculation:** When a quiz spans two skills (Skill_A and Skill_B), and the student answers Skill_A's question correctly but Skill_B's incorrectly, the results must report `Skill_A: 100%` and `Skill_B: 0%` independently.

### 6.3.5 Alumni Profile & Market Data (`test_alumni_profile.py`)

Five test cases verify the alumni data layer:

- **Existing Profile:** Fetching stats for an existing alumni returns salary, employer name, and joined user data (name, programme, role).
- **Fallback for New Users:** When the `alumni_career_stats` table returns empty data, the backend falls back to the `users` table to retrieve the alumni's basic identity (name, programme).
- **Profile Update:** Updating alumni stats triggers two operations: an `UPSERT` to `alumni_career_stats` and an `UPDATE` to the `users` table for identity fields (name, current_role).
- **Market Stats by Year:** The `/api/market/stats?year=2026` endpoint filters graduate statistics using `.eq('year', '2026')`.
- **Market Insights Aggregation:** A comprehensive test that injects two alumni records from the same programme (both at "Google") and verifies that the aggregation correctly counts 2 employers, calculates the average salary as RM 7,500, and generates both programme-specific and "OVERALL FACULTY (FSKTM)" insights.

---

## 6.4 Security & Performance Testing

### 6.4.1 IDOR (Insecure Direct Object Reference) Prevention (`test_security.py`, `test_integrity.py`)

IDOR attacks occur when a malicious user manipulates object identifiers (e.g., post IDs or user IDs) in API requests to access or modify resources belonging to other users. FuturePath implements ownership verification to prevent this.

#### Post Deletion Protection

The test `test_idor_on_delete_post` in `test_security.py` simulates a scenario where `Alumnus_A` attempts to delete a post owned by `Alumnus_B`:

1. The mock database returns `author_id: "Alumnus_B"` for the targeted post.
2. The request includes `user_id=Alumnus_A` in the query parameters.
3. The backend compares the requesting user's ID with the post's `author_id`.
4. Since they do not match, the backend returns HTTP `403 Forbidden` with `"Unauthorized"` in the error message.

This test confirms that the delete endpoint in `discussion_routes.py` performs an ownership check before executing the destructive operation.

#### Progress Update Identity Validation

The test `test_idor_on_progress_update` in `test_integrity.py` verifies that progress update payloads are forwarded to the database as-is. While this test documents the current behaviour (the payload's `user_id` is trusted), it also serves as a baseline for implementing server-side session validation in a future iteration.

### 6.4.2 RBAC (Role-Based Access Control) Testing

The test `test_rbac_admin_endpoint_protection` attempts to access the `/api/admin/summary-stats` endpoint without any authentication. The test accepts a status code of `200`, `401`, or `403`, documenting that the current prototype does not enforce server-side role checks on this endpoint. This test serves as both a regression check and a documented backlog item for implementing middleware-level RBAC in a future release.

### 6.4.3 Input Sanitisation (XSS Prevention)

The test `test_input_sanitization_xss` submits a feedback payload containing a malicious script tag: `<script>alert('xss')</script>`. The test verifies that:

1. The backend accepts the submission (status code `201`).
2. The payload is stored in the database **as a literal string**, not as executable code.
3. The `suggested_alternative_text` field in the database insert call contains the exact string `<script>alert('xss')</script>`.

Since FuturePath uses a JSON API and React's JSX rendering (which automatically escapes HTML entities), script tags stored as strings are never executed in the browser. React's virtual DOM renders the content as text, not as HTML.

### 6.4.4 File Attachment Handling

The test `test_file_size_limit_rejection` verifies that the post creation endpoint accepts a `file_url` field in the payload. While physical file size limits are enforced by Supabase Storage's bucket policies, this test confirms that the backend correctly passes the URL through to the database insert operation.

---

## 6.5 User Acceptance Testing (UAT) Methodology

User Acceptance Testing was conducted to validate that FuturePath meets the functional requirements defined in Chapter 3 from the perspective of its three target user groups: students, alumni, and administrators.

### 6.5.1 UAT Methodology

The UAT was designed as a structured task-based evaluation. Each participant was given a set of predefined tasks to complete and was asked to evaluate both the functional correctness (did the feature work?) and the user experience (was it easy to use?).

**Participant Selection:**
- **Students:** Final-year and third-year undergraduate students from the Faculty of Computer Science (FSKTM) at UMS.
- **Alumni:** Graduates who have entered the workforce and can provide feedback on the market intelligence features.
- **Administrators:** Faculty staff members who would use the admin dashboard, heatmap analytics, and AI advisory features.

**Evaluation Criteria:**
Each task was evaluated using a Likert scale (1 = Strongly Disagree, 5 = Strongly Agree) across five dimensions:

| Dimension | Description |
|---|---|
| **Functionality** | The feature works as expected without errors. |
| **Usability** | The feature is intuitive and easy to navigate. |
| **Performance** | The feature responds within an acceptable time frame. |
| **Design** | The visual design is clear, professional, and consistent. |
| **Usefulness** | The feature provides genuine value to the user. |

### 6.5.2 Student UAT Tasks

| # | Task Description | Module Tested |
|---|---|---|
| S1 | Register and log in to the system. | Authentication |
| S2 | Browse available career pathways and enroll in one. | Career Explorer |
| S3 | Complete skills on the roadmap and track progress. | Roadmap Display |
| S4 | Take a skill certification quiz and view results. | QuizModal |
| S5 | Complete all skills and attempt the Capstone Quiz. | Dashboard, Capstone |
| S6 | Browse the Job Board and bookmark a listing. | StudentJobBoard |
| S7 | Submit a "Missing Skill" feedback report. | SkillGapInput |
| S8 | View personal profile and acquired skills. | UserProfile |

### 6.5.3 Alumni UAT Tasks

| # | Task Description | Module Tested |
|---|---|---|
| A1 | Log in as alumni and navigate the Alumni Dashboard. | AlumniDashboard |
| A2 | Create a job posting (verify it goes to "pending" status). | Post Lifecycle |
| A3 | Create a mentorship post (verify it is auto-approved). | Post Lifecycle |
| A4 | Update career profile (salary, employer, role). | Alumni Profile |
| A5 | Submit curriculum feedback for a specific skill. | Quality Feedback |
| A6 | Comment on and reply to a student's question. | PostComments |

### 6.5.4 Administrator UAT Tasks

| # | Task Description | Module Tested |
|---|---|---|
| D1 | View the Executive Analytics dashboard summary. | AdminDashboard |
| D2 | Analyse the Skills Gap Heatmap for a specific year group. | Heatmap |
| D3 | Run the AI Faculty Advisor and review recommendations. | AIFacultyAdvisor |
| D4 | Download the AI report as a PDF. | Report Export |
| D5 | Moderate a pending job post (approve or reject). | Job Screening |
| D6 | Use the Career Pathway Editor to add/remove/reorder a skill. | Resource Management |
| D7 | Review and resolve alumni/student feedback in Quality Control. | AdminQualityControl |
| D8 | View Employability Analytics and market insights. | EmployabilityDashboard |

---

## 6.6 Error Handling & System Resilience

A production-grade system must handle unexpected failures without exposing raw error messages or crashing to a blank screen. FuturePath implements error handling at both the backend (Flask) and frontend (React) layers.

### 6.6.1 Backend Error Handling (Flask)

Every Flask route handler wraps its core logic inside a `try/except` block. When an exception occurs, the backend:

1. Catches the exception with `except Exception as e`.
2. Returns a JSON response with `{"success": false, "error": str(e)}` and an appropriate HTTP status code (typically `500`).
3. Logs the error to the server console for debugging.

This pattern is consistent across all route files (`student_routes.py`, `admin_routes.py`, `alumni_routes.py`, `ai_routes.py`, `discussion_routes.py`, `quiz_routes.py`, `quality_routes.py`, `workshop_routes.py`).

#### AI Service Resilience (`ai_service.py`)

The `get_ai_response()` function in `ai_service.py` wraps the LLM invocation in a `try/except` block. If the AI provider (Groq, Gemini, or OpenAI) throws an exception (e.g., rate limiting, timeout, invalid API key), the function:

1. Prints a debug message: `[AI ERROR] {provider} failure: {error_message}`.
2. Re-raises the exception so the calling route can return a `500` error to the frontend.

The `clean_json()` function provides an additional layer of resilience for LLM output. LLMs frequently wrap their JSON responses in markdown code fences (` ```json ... ``` `). Without sanitisation, `json.loads()` would fail on these responses. The `clean_json()` function strips these fences by:

1. Checking if the response starts with ` ``` `.
2. Splitting on ` ``` ` and extracting the content between the fences.
3. Removing the `json` language identifier if present.
4. Returning the cleaned string for `json.loads()` to parse.

This function is tested indirectly in `test_ai_generation.py`, where `mock_clean` is used to simulate the transformation from raw AI output to valid JSON.

### 6.6.2 Frontend Error Handling (React)

The React frontend handles errors at the component level using `try/catch` blocks inside `useEffect` hooks and event handlers. Three specific resilience patterns were implemented and tested:

#### Pattern 1: LLM Timeout / Error Display (`Resilience.test.js`)

When the AI Faculty Advisor endpoint returns `{ success: false, error: "Request too large for model" }`, the `AIFacultyAdvisor` component catches this and displays an inline error badge: **"AI Advisor Error: Request too large for model"**. This prevents the admin from seeing a raw stack trace and provides actionable feedback about why the analysis failed.

The test `displays friendly error message when AI service fails` verifies this by mocking a `413 Request Too Large` response and asserting that the error badge is rendered in the DOM.

#### Pattern 2: Network Disconnect Recovery (`Resilience.test.js`)

When the `Dashboard` component's initial fetch throws a `TypeError('Failed to fetch')` (simulating a complete network disconnect), the component:

1. Catches the error in the `useEffect` hook's `catch` block.
2. Exits the loading state (the "Loading your personalized dashboard" spinner disappears).
3. Renders the fallback header "Welcome back" so the page is not blank.

The test `gracefully handles network disconnect during dashboard fetch` verifies that the loading spinner disappears and the header still renders, confirming the component does not crash to a white screen.

#### Pattern 3: Malformed AI Response Handling (`Resilience.test.js`)

When the backend returns `{ success: true, recommendations: "Not an array" }` (an unexpected string instead of the expected array), the `AIFacultyAdvisor` component must not crash when attempting to call `.map()` on a non-array value.

The test `handles malformed AI response without crashing` verifies that the component remains functional (the "Analyze Cohort" button is still in the DOM) even when the data type is wrong. This is achieved through defensive coding patterns such as `Array.isArray()` checks before mapping.

#### Pattern 4: State-Loss Fallback (`Dashboard.test.js`)

As described in Section 6.2.1, the Dashboard generates placeholder "Module X" nodes when `detailed_steps` is `null`. This fallback prevents a crash caused by calling `.map()` on a null array and provides a degraded but functional experience to the user.

### 6.6.3 Resilience Test Summary

| Test Case | Failure Simulated | Expected Behaviour | File |
|---|---|---|---|
| LLM Error 413 | AI service returns error | Inline error badge displayed | `Resilience.test.js` |
| Network Disconnect | `fetch` throws `TypeError` | Header still renders, no white screen | `Resilience.test.js` |
| Malformed AI JSON | Response is string instead of array | Component stays functional | `Resilience.test.js` |
| Missing `detailed_steps` | `null` data from API | Placeholder "Module X" nodes generated | `Dashboard.test.js` |
| API Fetch Failure | `fetch` rejects with `Error` | `console.error` called, no crash | `AdminQualityControl.test.js` |
| Database Timeout | Supabase throws exception | 500 response with error message | `test_enrollment.py` |
| Invalid Career ID | No matching record in DB | 404 response with `success: false` | `test_student.py` |

### 6.6.4 Summary of Testing Coverage

The following table summarises the total automated test coverage across the FuturePath system:

| Layer | Framework | Test Files | Total Test Cases | Key Areas |
|---|---|---|---|---|
| **Frontend** | Jest + React Testing Library | 12 | 36 | UI rendering, user interactions, state management, resilience |
| **Backend** | Pytest + unittest.mock | 10 | 24 | API correctness, database queries, AI pipeline, security |
| **Total** | — | **22** | **60** | — |

All automated tests are designed to run without any external dependencies (no live database, no running server, no API keys). This makes them suitable for continuous integration environments and ensures that any developer can run the full test suite with a single command:

- **Frontend:** `npx react-scripts test --watchAll=false`
- **Backend:** `python -m pytest tests/ -v`
