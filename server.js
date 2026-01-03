// server.js
require("dotenv").config();

const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();

// ------------------ Middleware Setup ------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use("/uploads", express.static("uploads"));

// ------------------ Multer Setup ------------------
const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueName + path.extname(file.originalname));
    },
});
const upload = multer({ storage });
const uploadFields = upload.fields([
    { name: "documents", maxCount: 10 },
    { name: "profilePicture", maxCount: 1 }
]);

// ------------------ MySQL Connection ------------------
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
        ca: fs.readFileSync(path.join(__dirname, "certs", "ca.pem")),
        rejectUnauthorized: false
    }
});

connection.connect((err) => {
    if (err) {
        console.error("❌ Database connection failed:", err.message);
        process.exit(1);
    } else {
        console.log("✅ Connected to Aiven MySQL successfully!");

        // Check notifications table structure
        connection.query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                project_id INT NOT NULL,
                joinee_id INT NOT NULL,
                message TEXT NOT NULL,
                is_read BOOLEAN DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (project_id) REFERENCES projects(id),
                FOREIGN KEY (joinee_id) REFERENCES users(id)
            )
        `, (err) => {
            if (err) {
                console.error("❌ Error creating notifications table:", err.message);
            } else {
                console.log("✅ Notifications table verified/created successfully");
            }
        });
    }
});

// ------------------ JWT Authentication Middleware ------------------
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        console.log('Authentication: No token provided');
        return res.status(401).json({ message: 'Authentication required: No token provided.' });
    }

    jwt.verify(token, process.env.JWT_SECRET || "default_secret", (err, user) => {
        if (err) {
            console.error('JWT Verification Error:', err.message);
            return res.status(403).json({ message: 'Forbidden: Invalid or expired token.', details: err.message });
        }
        req.userId = user.id;
        next();
    });
};

// ------------------ Routes ------------------

// -------- Signup Route --------
app.post("/signup", uploadFields, async (req, res) => {
    try {
        const {
            name, email, password, rollNumber,
            department, yearOfStudy, phoneNumber
        } = req.body;

        if (!name || !email || !password || !rollNumber) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const profilePicFile = req.files?.profilePicture?.[0];
        const profilePicturePath = profilePicFile ? `/uploads/${profilePicFile.filename}` : null;
        const documentFiles = req.files?.documents || [];

        let skills = [], projects = [];

        try {
            skills = typeof req.body.skills === "string" ? JSON.parse(req.body.skills) : req.body.skills || [];
            projects = typeof req.body.projects === "string" ? JSON.parse(req.body.projects) : req.body.projects || [];
        } catch (parseError) {
            return res.status(400).json({ error: "Invalid JSON in skills or projects", detail: parseError.message });
        }

        connection.beginTransaction((err) => {
            if (err) return res.status(500).json({ error: "Transaction start failed", detail: err.message });

            const insertUserSql = `
                INSERT INTO users 
                (name, email, password, roll_number, department, year_of_study, phone_number, profile_picture) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

            const userValues = [name, email, hashedPassword, rollNumber, department, yearOfStudy, phoneNumber, profilePicturePath];

            connection.query(insertUserSql, userValues, (err, result) => {
                if (err) {
                    console.error("User insert failed:", err);
                    return connection.rollback(() => res.status(500).json({ error: "User insert failed", detail: err.message }));
                }

                const userId = result.insertId;
                const totalInserts = skills.length + projects.length + documentFiles.length;

                if (totalInserts === 0) {
                    return connection.commit(err => {
                        if (err) {
                            console.error("Commit failed for user only:", err);
                            return connection.rollback(() => res.status(500).json({ error: "Commit failed for user only", detail: err.message }));
                        }
                        return res.json({ message: "✅ User Registered Successfully" });
                    });
                }

                let completed = 0, hasError = false;
                const checkDone = () => {
                    completed++;
                    if (completed === totalInserts && !hasError) {
                        connection.commit(err => {
                            if (err) {
                                console.error("Commit failed after details:", err);
                                return connection.rollback(() => res.status(500).json({ error: "Commit failed after details", detail: err.message }));
                            }
                            return res.json({ message: "✅ User Registered Successfully" });
                        });
                    }
                };

                skills.forEach(skill => {
                    connection.query(`INSERT INTO skills (user_id, skill_name) VALUES (?, ?)`, [userId, skill], (err) => {
                        if (err && !hasError) {
                            hasError = true;
                            console.error("Skill insert failed:", err);
                            return connection.rollback(() => res.status(500).json({ error: "Skill insert failed", detail: err.message }));
                        }
                        if (!hasError) checkDone();
                    });
                });

                // FIX: Add 'type' to projects insert
                projects.forEach(({ project_name, project_description, links, type = 'project' }) => { // Default to 'project'
                    connection.query(`INSERT INTO projects (user_id, project_name, project_description, links, type) VALUES (?, ?, ?, ?, ?)`,
                        [userId, project_name, project_description, links, type], (err) => {
                            if (err && !hasError) {
                                hasError = true;
                                console.error("Project insert failed:", err);
                                return connection.rollback(() => res.status(500).json({ error: "Project insert failed", detail: err.message }));
                            }
                            if (!hasError) checkDone();
                        });
                });

                documentFiles.forEach(doc => {
                    connection.query(`INSERT INTO documents (user_id, document_name, file_path) VALUES (?, ?, ?)`,
                        [userId, doc.originalname, `/uploads/${doc.filename}`], (err) => {
                            if (err && !hasError) {
                                hasError = true;
                                console.error("Document insert failed:", err);
                                return connection.rollback(() => res.status(500).json({ error: "Document insert failed", detail: err.message }));
                            }
                            if (!hasError) checkDone();
                        });
                });
            });
        });
    } catch (err) {
        console.error("❌ Signup Failure:", err);
        res.status(500).json({ error: "Internal Server Error", detail: err.message });
    }
});

// -------- Login Route --------
app.post("/login", (req, res) => {
    const { email, password } = req.body;

    const sql = "SELECT * FROM users WHERE email = ?";
    connection.query(sql, [email], async (err, results) => {
        if (err) {
            console.error("Database error during login:", err);
            return res.status(500).json({ error: "Database error during login", detail: err.message });
        }
        if (results.length === 0) return res.status(400).json({ error: "User not found" });

        const user = results[0];
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return res.status(400).json({ error: "Invalid credentials" });

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET || "default_secret",
            { expiresIn: "1h" }
        );

        res.json({
            message: "✅ Login successful",
            token,
            userId: user.id,
            name: user.name,
            profile_picture: user.profile_picture
        });
    });
});

// -------- Fetch User Profile --------
app.get("/profile/:userId", (req, res) => {
    const { userId } = req.params;

    const getUserSql = `
        SELECT id, name, email, phone_number, department, year_of_study, 
               roll_number, profile_picture 
        FROM users 
        WHERE id = ?`;

    // FIX: Include 'type' in projects select
    const getProjectsSql = `SELECT project_name, project_description, links, type FROM projects WHERE user_id = ?`;
    const getSkillsSql = `SELECT skill_name FROM skills WHERE user_id = ?`;
    const getDocumentsSql = `SELECT document_name AS name, file_path AS file FROM documents WHERE user_id = ?`;

    connection.query(getUserSql, [userId], (err, userResults) => {
        if (err) {
            console.error("Error fetching user:", err);
            return res.status(500).json({ error: "Error fetching user", detail: err.message });
        }
        if (userResults.length === 0) return res.status(404).json({ error: "User not found" });

        const user = userResults[0];

        connection.query(getProjectsSql, [userId], (err, projectResults) => {
            if (err) {
                console.error("Error fetching projects for profile:", err);
                return res.status(500).json({ error: "Error fetching projects for profile", detail: err.message });
            }

            connection.query(getSkillsSql, [userId], (err, skillResults) => {
                if (err) {
                    console.error("Error fetching skills for profile:", err);
                    return res.status(500).json({ error: "Error fetching skills for profile", detail: err.message });
                }

                connection.query(getDocumentsSql, [userId], (err, documentResults) => {
                    if (err) {
                        console.error("Error fetching documents for profile:", err);
                        return res.status(500).json({ error: "Error fetching documents for profile", detail: err.message });
                    }

                    const fullProfile = {
                        ...user,
                        projects: projectResults,
                        skills: skillResults.map(s => s.skill_name),
                        documents: documentResults,
                    };

                    res.json({ message: "Profile data retrieved", user: fullProfile });
                });
            });
        });
    });
});

// -------- Fetch All Users (Dev Test) --------
app.get("/users", (req, res) => {
    console.log("📥 Incoming GET /users request");

    connection.query("SELECT * FROM users", (err, results) => {
        if (err) {
            console.error("❌ Error fetching users:", err.message);
            return res.status(500).json({ error: "Database error while fetching users", detail: err.message });
        }

        res.json(results);
    });
});

// -------- Test DB Connection Route --------
app.get("/test-db", (req, res) => {
    connection.query("SELECT 1 + 1 AS result", (err, result) => {
        if (err) {
            console.error("❌ DB Test Failed:", err.message);
            return res.status(500).json({ error: "DB connection test failed", detail: err.message });
        }
        res.json({ message: "✅ DB is working", result });
    });
});


// Get User's Projects (Authenticated GET endpoint for the host's "Projects" page)
app.get('/api/projects', authenticateToken, (req, res) => {
    const userId = req.userId;

    if (!userId) {
        return res.status(401).json({ message: 'User not authenticated after token verification.' });
    }

    // FIX: Include p.type in the SELECT statement
    const query = `
        SELECT p.id, p.project_name, p.project_description, p.links, p.user_id, p.type, u.name AS creator_name
        FROM projects p
        JOIN users u ON p.user_id = u.id
        WHERE p.user_id = ?`;

    connection.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching user events:', err);
            return res.status(500).json({ message: 'Error fetching your events.', detail: err.message });
        }
        res.json(results);
    });
});

// Create New Project (Authenticated POST endpoint)
app.post('/api/projects', authenticateToken, (req, res) => {
    const userId = req.userId;
    // FIX: Destructure 'type' from req.body, default to 'project' if not provided
    const { project_name, project_description, links, type = 'project' } = req.body;

    if (!userId) {
        return res.status(401).json({ message: 'User not authenticated for event creation.' });
    }
    if (!project_name) {
        return res.status(400).json({ message: 'Event name is required.' });
    }

    // FIX: Include 'type' in the INSERT statement
    const query = 'INSERT INTO projects (user_id, project_name, project_description, links, type) VALUES (?, ?, ?, ?, ?)';
    connection.query(query, [userId, project_name, project_description, links, type], (err, result) => {
        if (err) {
            console.error('Error creating event:', err);
            return res.status(500).json({ message: 'Error creating event.', detail: err.message });
        }
        res.status(201).json({
            id: result.insertId,
            user_id: userId,
            project_name,
            project_description,
            links,
            type, // FIX: Include type in the response
        });
    });
});

// DELETE a project by ID (Authenticated DELETE endpoint)
app.delete('/api/projects/:id', authenticateToken, (req, res) => {
    const projectId = req.params.id;
    const userId = req.userId;

    if (!projectId) {
        return res.status(400).json({ message: 'Event ID is required for deletion.' });
    }

    if (!userId) {
        return res.status(401).json({ message: 'Authentication required for Event deletion.' });
    }

    // Step 1: Verify that the project belongs to the authenticated user
    const checkOwnershipQuery = 'SELECT user_id FROM projects WHERE id = ?';
    connection.query(checkOwnershipQuery, [projectId], (err, results) => {
        if (err) {
            console.error('Database error checking Event ownership:', err);
            return res.status(500).json({ message: 'Internal server error checking Event ownership.', detail: err.message });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Event not found.' });
        }

        if (results[0].user_id !== userId) {
            return res.status(403).json({ message: 'You are not authorized to delete this event.' });
        }

        // Step 2: If authorized, proceed with deletion
        const deleteQuery = 'DELETE FROM projects WHERE id = ? AND user_id = ?';
        connection.query(deleteQuery, [projectId, userId], (err, result) => {
            if (err) {
                console.error('Database error deleting event:', err);
                return res.status(500).json({ message: 'Internal server error while deleting event.', detail: err.message });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: 'Event not found or already deleted.' });
            }

            res.status(200).json({ message: 'Event deleted successfully!' });
        });
    });
});

// NEW: Get All Projects (for the Collaborate page)
app.get('/api/all-projects', authenticateToken, (req, res) => {
    // No userId filter here, as we want all projects
    // FIX: Include p.type in the SELECT statement
    const query = `
        SELECT p.id, p.project_name, p.project_description, p.links, p.user_id, p.type, u.name AS creator_name
        FROM projects p
        JOIN users u ON p.user_id = u.id
        ORDER BY p.id DESC`; // Order by ID to show latest first

    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching all events:', err);
            return res.status(500).json({ message: 'Error fetching all events.', detail: err.message });
        }
        res.json(results);
    });
});

// NEW: Register for a Project
app.post('/api/projects/:id/register', authenticateToken, (req, res) => {
    const projectId = req.params.id;
    const userId = req.userId; // User registering

    console.log('Registration attempt - Project ID:', projectId, 'User ID:', userId);

    if (!projectId) {
        return res.status(400).json({ message: 'Event ID is required for registration.' });
    }
    if (!userId) {
        return res.status(401).json({ message: 'Authentication required to register for an event.' });
    }

    // First, get the project details to get the owner's ID
    const getProjectQuery = 'SELECT user_id, project_name, type FROM projects WHERE id = ?';
    connection.query(getProjectQuery, [projectId], (err, projectResults) => {
        if (err) {
            console.error('Error getting project details:', err);
            return res.status(500).json({ message: 'Error getting project details.', detail: err.message });
        }

        if (projectResults.length === 0) {
            return res.status(404).json({ message: 'Project not found.' });
        }

        const projectOwnerId = projectResults[0].user_id;
        const projectName = projectResults[0].project_name;
        const projectType = projectResults[0].type;

        console.log('Project details found - Owner ID:', projectOwnerId, 'Project Name:', projectName);

        // Get the registering user's name
        const getUserQuery = 'SELECT name FROM users WHERE id = ?';
        connection.query(getUserQuery, [userId], (err, userResults) => {
            if (err) {
                console.error('Error getting user details:', err);
                return res.status(500).json({ message: 'Error getting user details.', detail: err.message });
            }

            if (userResults.length === 0) {
                return res.status(404).json({ message: 'User not found.' });
            }

            const joineeName = userResults[0].name;
            console.log('User details found - Joinee Name:', joineeName);

            // Start a transaction
            connection.beginTransaction(err => {
                if (err) {
                    console.error('Error starting transaction:', err);
                    return res.status(500).json({ message: 'Error starting transaction.', detail: err.message });
                }

                console.log('Transaction started');

                // Check if already registered
                const checkRegistrationQuery = 'SELECT * FROM registrations WHERE user_id = ? AND project_id = ?';
                connection.query(checkRegistrationQuery, [userId, projectId], (err, existingRegistrations) => {
                    if (err) {
                        console.error('Error checking existing registration:', err);
                        return connection.rollback(() => {
                            res.status(500).json({ message: 'Error checking existing registration.', detail: err.message });
                        });
                    }

                    if (existingRegistrations.length > 0) {
                        return connection.rollback(() => {
                            res.status(409).json({ message: 'You have already registered for this event.' });
                        });
                    }

                    // Insert the registration
                    const insertRegistrationQuery = 'INSERT INTO registrations (project_id, user_id) VALUES (?, ?)';
                    connection.query(insertRegistrationQuery, [projectId, userId], (err, result) => {
                        if (err) {
                            console.error('Error registering for project:', err);
                            return connection.rollback(() => {
                                res.status(500).json({ message: 'Internal server error during registration.', detail: err.message });
                            });
                        }

                        console.log('Registration inserted successfully');

                        // Create notification for the project owner
                        const message = `${joineeName} has registered for your ${projectType}: ${projectName}`;
                        const insertNotificationQuery = `
                            INSERT INTO notifications (user_id, project_id, joinee_id, message, is_read)
                            VALUES (?, ?, ?, ?, 0)`;

                        console.log('Attempting to create notification with:', {
                            user_id: projectOwnerId,
                            project_id: projectId,
                            joinee_id: userId,
                            message: message
                        });

                        connection.query(insertNotificationQuery, [projectOwnerId, projectId, userId, message], (err) => {
                            if (err) {
                                console.error('Error creating notification:', err);
                                return connection.rollback(() => {
                                    res.status(500).json({ message: 'Error creating notification.', detail: err.message });
                                });
                            }

                            console.log('Notification created successfully');

                            // Commit the transaction
                            connection.commit(err => {
                                if (err) {
                                    console.error('Error committing transaction:', err);
                                    return connection.rollback(() => {
                                        res.status(500).json({ message: 'Error committing transaction.', detail: err.message });
                                    });
                                }
                                console.log('Transaction committed successfully');
                                res.status(201).json({
                                    message: 'Successfully registered for the event!',
                                    registrationId: result.insertId
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});

// NEW: Get Registered Users for a Specific Project (for the host's view)
app.get('/api/projects/:id/registrations', authenticateToken, (req, res) => {
    const projectId = req.params.id;
    const hostUserId = req.userId; // The user requesting this info (must be the project host)

    if (!projectId) {
        return res.status(400).json({ message: 'Project ID is required to fetch registrations.' });
    }
    if (!hostUserId) {
        return res.status(401).json({ message: 'Authentication required to view registrations.' });
    }

    // Step 1: Verify that the requesting user is the host of the project
    const checkHostQuery = 'SELECT user_id FROM projects WHERE id = ?';
    connection.query(checkHostQuery, [projectId], (err, projectResults) => {
        if (err) {
            console.error('Database error checking project host:', err);
            return res.status(500).json({ message: 'Internal server error checking project host.', detail: err.message });
        }

        if (projectResults.length === 0) {
            return res.status(404).json({ message: 'Project not found.' });
        }

        if (projectResults[0].user_id !== hostUserId) {
            return res.status(403).json({ message: 'You are not authorized to view registrations for this project.' });
        }

        // Step 2: If authorized, fetch the registered users
        const getRegistrationsQuery = `
            SELECT r.user_id, u.name, u.email
            FROM registrations r
            JOIN users u ON r.user_id = u.id
            WHERE r.project_id = ?`;

        connection.query(getRegistrationsQuery, [projectId], (err, registeredUsers) => {
            if (err) {
                console.error('Database error fetching registered users:', err);
                return res.status(500).json({ message: 'Internal server error fetching registered users.', detail: err.message });
            }
            res.json(registeredUsers);
        });
    });
});

// Create notification
app.post('/api/notifications', authenticateToken, (req, res) => {
    const { userId, projectId, joineeId } = req.body;

    // Get project owner and joinee details
    const getDetailsQuery = `
        SELECT p.user_id as owner_id, u.name as joinee_name
        FROM projects p
        JOIN users u ON u.id = ?
        WHERE p.id = ?`;

    connection.query(getDetailsQuery, [joineeId, projectId], (err, results) => {
        if (err) {
            console.error('Error getting project details:', err);
            return res.status(500).json({ message: 'Error creating notification', detail: err.message });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Project or user not found' });
        }

        const { owner_id, joinee_name } = results[0];
        const message = `${joinee_name} has joined your project!`;

        const insertQuery = `
            INSERT INTO notifications (user_id, project_id, joinee_id, message)
            VALUES (?, ?, ?, ?)`;

        connection.query(insertQuery, [owner_id, projectId, joineeId, message], (err, result) => {
            if (err) {
                console.error('Error creating notification:', err);
                return res.status(500).json({ message: 'Error creating notification', detail: err.message });
            }
            res.status(201).json({ message: 'Notification created successfully' });
        });
    });
});

// Get user notifications
app.get('/api/notifications/:userId', authenticateToken, (req, res) => {
    const { userId } = req.params;

    const query = `
        SELECT 
            n.*,
            p.project_name as project_title,
            p.type as project_type,
            u.name as joinee_username
        FROM notifications n
        JOIN projects p ON n.project_id = p.id
        JOIN users u ON n.joinee_id = u.id
        WHERE n.user_id = ?
        ORDER BY n.created_at DESC
        LIMIT 50`;

    connection.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching notifications:', err);
            return res.status(500).json({ message: 'Error fetching notifications', detail: err.message });
        }
        res.json(results);
    });
});

// Mark notifications as read
app.put('/api/notifications/:userId/read', authenticateToken, (req, res) => {
    const { userId } = req.params;

    const query = `
        UPDATE notifications 
        SET is_read = 1 
        WHERE user_id = ? AND is_read = 0`;

    connection.query(query, [userId], (err, result) => {
        if (err) {
            console.error('Error marking notifications as read:', err);
            return res.status(500).json({ message: 'Error marking notifications as read', detail: err.message });
        }
        res.json({ message: 'Notifications marked as read' });
    });
});

// Get unread notification count
app.get('/api/notifications/:userId/unread', authenticateToken, (req, res) => {
    const { userId } = req.params;

    const query = `
        SELECT COUNT(*) as count 
        FROM notifications 
        WHERE user_id = ? AND is_read = 0`;

    connection.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error getting unread count:', err);
            return res.status(500).json({ message: 'Error getting unread count', detail: err.message });
        }
        res.json({ count: results[0].count });
    });
});

// ------------------ Start Server ------------------
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
