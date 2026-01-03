# Student Skill Profiling Platform

## 1. Project Overview

**The Real-World Problem:**
In the academic ecosystem, students often struggle to gain visibility for their skills and projects beyond their immediate circle of peers. Traditional social networks are too broad, and professional networks like LinkedIn can be intimidating or ill-suited for early-stage collaboration.

**Why Existing Solutions Fall Short:**
- **Fragmented Discovery:** Students resort to WhatsApp groups or notice boards to find teammates for hackathons or research.
- **Verification Gaps:** There is no centralized, verified way to showcase academic contributions, projects, and department-specific achievements.
- **Collaboration Friction:** Connecting with peers from different years or departments is socially constrained and technically unsupported.

This platform bridges this gap, providing a dedicated, structured environment for students to build their professional identity, showcase their portfolio, and discover opportunities within their campus ecosystem.

## 2. Problem Statement
The current campus environment suffers from:
1.  **Fragmented Peer Discovery:** Talent is siloed within departments. A Computer Science student seeking a designer from the Arts department has no efficient discovery mechanism.
2.  **Lack of Verified Profiles:** Self-reported skills lack context. A system tied to academic identity (Roll Number, Department) adds a layer of trust.
3.  **Collaboration Inefficiency:** Finding collaborators for events and projects remains a manual, word-of-mouth process.

## 3. User Personas & Stakeholders

### **Student Users**
- **Goal:** Build a portfolio, find teammates, and register for campus events.
- **Pain Point:** "I have the skills, but no one knows outside my class."
- **Behavior:** Frequent updates to project links, browsing the event feed, and connecting with seniors/peers.

### **Event Organizers / Project Leads**
- **Goal:** Promoting hackathons, workshops, or seeking contributors for open-source projects.
- **Pain Point:** Low turnout or mismatch in applicant skills.

## 4. Core Features

- **Professional Profile System:** detailed profiles including academic stats (Year, Dept, Roll No), skills tags, and persistent project portfolios.
- **Secure Authentication:** JWT-based stateless session management with bcrypt password hashing.
- **Opportunity Feed:** A centralized dashboard (`/register`) aggregating all ongoing projects and upcoming events.
- **Graph-like Interactions:** Users can register for events, effectively creating edges between "User" and "Project" nodes in the data model.
- **Direct Navigation:** Seamless traversal from project listings to creator profiles to foster networking.
- **Responsive Interface:** Glassmorphism-based UI tailored for modern web standards, ensuring accessibility across devices.

## 5. System Architecture

The application follows a **Client-Server Architecture** decoupled via a RESTful API.

### **High-Level Design**
`[React Frontend]` <---> `[Express.js Middleware]` <---> `[MySQL Database]`

- **Frontend:** Single Page Application (SPA) built with React.js using standard Hooks (`useState`, `useEffect`, `useContext`) for state management.
- **Backend:** Node.js/Express REST API handling business logic, validation, and database transactions.
- **Database:** Aiven Managed MySQL instance for relational data integrity.

### **Data Modeling**
- **Users:** The core entity containing profile metadata.
- **Projects/Events:** Polymorphic entity distinguishable by a `type` field ('project' vs 'event').
- **Registrations:** A junction table representing the N:M relationship between Users and Events.
- **Notifications:** Asynchronous updates triggered by state changes (e.g., new registration).

## 6. Key Engineering Decisions

- **Authentication: JWT (JSON Web Tokens)**
    - *Decision:* Used stateless JWTs request headers (`Authorization: Bearer <token>`) instead of server-side sessions.
    - *Why:* Simplifies scaling (no sticky sessions needed) and reduces database load on ensuring session validity for every request.

- **Styling: Tailwind CSS**
    - *Decision:* Utility-first CSS framework.
    - *Why:* Enforced design consistency (color palette, spacing) and significantly reduced CSS bundle size compared to traditional stylesheets. Enabled rapid iteration of the "Glassmorphism" theme.

- **State Management: Context API**
    - *Decision:* React Context (`AuthContext`) for global user state.
    - *Why:* Avoided the complexity of Redux for this scope. Context provides a sufficient mechanism for avoiding prop-drilling authentication status across the component tree.

- **Database: Relational (MySQL)**
    - *Decision:* Normalized SQL schema.
    - *Why:* The data is highly structured (Users have strict Departments; Projects belong to Users). ACID compliance ensures data integrity, especially for registrations and profile updates.

## 7. Scalability, Reliability & Performance

- **Relational Integrity:** Foreign key constraints ensure that if a user is deleted, their data is handled deterministically, preventing orphan records.
- **Connection Pooling:** The backend utilizes MySQL connection pooling to handle concurrent requests efficiently without the overhead of establishing a new connection per request.
- **Cloud-Native Database:** Leveraging Aiven's managed MySQL ensures high availability and automated backups, surpassing local instance reliability.
- **Component Reusability:** Modular components (`EventCard`, `EventDetailModal`) reduce code duplication and bundle size, improving client-side rendering performance.

## 8. Security & Privacy

- **Password Hashing:** All user passwords are hashed using `bcrypt` before storage. Plain text passwords never touch the database.
- **Access Control:** `authenticateToken` middleware protects sensitive endpoints. Users cannot modify or delete projects they do not own (Server-side validation).
- **Environment Variables:** Credentials (DB connection, JWT Secret) are strictly separated from the codebase using `.env` files, preventing accidental leaks in version control.
- **CORS Policy:** strict Cross-Origin Resource Sharing rules to prevent unauthorized domain access.

## 9. Tech Stack

- **Frontend:** React.js, Tailwind CSS, React Router v6, Axios/Fetch API
- **Backend:** Node.js, Express.js
- **Database:** MySQL (Aiven Cloud)
- **Authentication:** JSON Web Tokens (JWT), Bcrypt.js
- **DevOps/Infra:** GitHub for version control, Environment configuration handling.

## 10. Setup & Local Development

To run this project locally:

1.  **Prerequisites:** Node.js (v16+) and npm installed.
2.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/student-profiler.git
    cd student-profiler
    ```
3.  **Install Dependencies:**
    ```bash
    npm install
    ```
4.  **Configure Environment:**
    - Create a `.env` file in the root.
    - Add: `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`.
5.  **Start the Application:**
    - The backend and frontend run concurrently via the start script.
    ```bash
    npm start
    ```
6.  **Access:** Open `http://localhost:3000` in your browser.

## 11. Testing & Validation

- **Manual API Testing:** Postman was used to verify all endpoints (Auth, CRUD operations) before frontend integration.
- **Edge Cases Handled:**
    - Trying to register for the same event twice (handled via 409 Conflict).
    - Accessing protected routes without a token (Graceful redirect to Login).
    - Network failure during profile fetching (Loading/Error states in UI).

## 12. Future Improvements

- **Search & Filtering:** Implementing server-side search based on skills or project tags to improve discovery as the dataset grows.
- **Real-time Chat:** Integrating `Socket.io` to allow direct messaging between collaborators.
- **Resume Parsing:** NLP implementation to auto-fill skills from uploaded resumes.
- **Containerization:** Adding a `Dockerfile` for consistent deployment across environments.

## 13. What I Learned

- **System Design:** Moving from simple coding to thinking about "Architecture" — how data flows from the DB to the API to the UI.
- **State Persistence:** Struggled initially with keeping users logged in on refresh. Learned deep lessons about `localStorage`, React Context, and synchronization.
- **Professional UI/UX:** Learned that "Functionality" isn't enough; the user experience (Glassmorphism, feedback loops) determines the perceived quality of the software.
- **Transaction Management:** Implementing DB transactions to ensure complex operations (like User Signup with multiple related tables) either complete fully or roll back, ensuring data consistency.