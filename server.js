const express = require("express");
const mysql = require("mysql2");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(__dirname));

// ==================== CONNECT TO XAMPP MYSQL ====================

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "placement_portal",
    port: 3306
});

db.connect((err) => {
    if (err) {
        console.log("MySQL Error:", err.message);
        console.log("Make sure XAMPP MySQL is running!");
        process.exit(1);
    }
    console.log("MySQL Connected");
});

// Create tables
db.query(`CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password VARCHAR(100),
    role VARCHAR(20) DEFAULT 'student'
)`);

db.query(`CREATE TABLE IF NOT EXISTS jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100),
    company VARCHAR(100),
    location VARCHAR(100)
)`);

db.query(`CREATE TABLE IF NOT EXISTS applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    jobtitle VARCHAR(100),
    student VARCHAR(100)
)`);

// Insert admin
db.query("INSERT IGNORE INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
    ["Admin User", "admin@gmail.com", "admin123", "admin"]);

// Insert demo jobs if empty
db.query("SELECT COUNT(*) as count FROM jobs", (err, result) => {
    if (!err && result[0].count === 0) {
        const jobs = [
            ["Web Developer", "Infosys", "Bangalore"],
            ["Java Developer", "TCS", "Mumbai"],
            ["Frontend Developer", "Wipro", "Hyderabad"],
            ["Data Analyst", "Accenture", "Pune"],
            ["DevOps Engineer", "IBM", "Chennai"],
            ["Mobile Developer", "Google", "Bangalore"]
        ];
        jobs.forEach(j => db.query("INSERT INTO jobs (title, company, location) VALUES (?, ?, ?)", j));
        console.log("Demo jobs added");
    }
});

// ==================== ROUTES ====================

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/register", (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.send("All fields required <a href='/register.html'>Back</a>");
    }
    db.query("INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
        [name, email, password], (err) => {
            if (err) return res.send("Email already exists <a href='/register.html'>Back</a>");
            res.redirect("/login.html");
        });
});

app.post("/login", (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.send("Enter email and password <a href='/login.html'>Back</a>");
    }
    db.query("SELECT * FROM users WHERE email = ? AND password = ?",
        [email, password], (err, result) => {
            if (err || result.length === 0) {
                return res.send("Invalid credentials. Try admin@gmail.com / admin123 <a href='/login.html'>Back</a>");
            }
            const user = result[0];
            if (user.role === "admin") {
                return res.redirect("/admin?email=" + encodeURIComponent(email));
            }
            res.redirect("/dashboard?user=" + encodeURIComponent(user.name));
        });
});

app.get("/dashboard", (req, res) => {
    res.sendFile(path.join(__dirname, "dashboard.html"));
});

// ==================== ADMIN ROUTE - NOW REDIRECTS TO LOGIN IF NOT LOGGED IN ====================

app.get("/admin", (req, res) => {
    const email = req.query.email || "";
    
    // If no email in URL, redirect to login page
    if (!email) {
        return res.redirect("/login.html");
    }
    
    // Check if this email is admin
    db.query("SELECT * FROM users WHERE email = ? AND role = 'admin'", [email], (err, result) => {
        if (err || result.length === 0) {
            return res.status(403).send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <link rel="stylesheet" href="/style.css">
                    <meta charset="UTF-8">
                </head>
                <body style="display:flex;align-items:center;justify-content:center;min-height:100vh;background:linear-gradient(135deg,#0f172a,#1e1b4b);">
                    <div class="glass-card" style="text-align:center;max-width:400px;padding:2rem;">
                        <div style="font-size:4rem;margin-bottom:1rem;">🚫</div>
                        <h2 style="margin-bottom:1rem;">Access Denied</h2>
                        <p style="color:#94a3b8;margin-bottom:1.5rem;">Only administrators can access this page.</p>
                        <a href="/login.html" class="btn">Go to Login</a>
                    </div>
                </body>
                </html>
            `);
        }
        
        // Admin confirmed - serve the admin page
        res.sendFile(path.join(__dirname, "admin.html"));
    });
});

app.post("/addjob", (req, res) => {
    const { title, company, location } = req.body;
    db.query("INSERT INTO jobs (title, company, location) VALUES (?, ?, ?)",
        [title, company, location], (err) => {
            if (err) return res.send("Error adding job");
            res.redirect("/admin?email=admin@gmail.com");
        });
});

app.get("/delete/:id", (req, res) => {
    const id = req.params.id;
    db.query("DELETE FROM users WHERE id = ?", [id], (err) => {
        res.redirect("/admin?email=admin@gmail.com");
    });
});

app.get("/apply/:title", (req, res) => {
    const title = req.params.title;
    const student = req.query.user || "Student";
    db.query("INSERT INTO applications (jobtitle, student) VALUES (?, ?)",
        [title, student], (err) => {
            if (err) return res.send("Apply failed");
            res.send(`
                <html><head><link rel="stylesheet" href="/style.css"></head>
                <body style="display:flex;align-items:center;justify-content:center;min-height:100vh;">
                    <div class="glass-card" style="text-align:center;max-width:400px;">
                        <div style="font-size:4rem;margin-bottom:1rem;">🎉</div>
                        <h2>Applied Successfully!</h2>
                        <p style="color:#94a3b8;margin:1rem 0;">You applied for <strong>${title}</strong></p>
                        <a href="/dashboard?user=${encodeURIComponent(student)}" class="btn">Back to Dashboard</a>
                    </div>
                </body></html>
            `);
        });
});

app.get("/api/users", (req, res) => {
    db.query("SELECT id, name, email, role FROM users", (err, result) => {
        if (err) return res.json([]);
        res.json(result);
    });
});

app.get("/api/jobs", (req, res) => {
    db.query("SELECT * FROM jobs", (err, result) => {
        if (err) return res.json([]);
        res.json(result);
    });
});

app.listen(PORT, () => {
    console.log("Server running at http://localhost:3000");
    console.log("Admin: admin@gmail.com / admin123");
});