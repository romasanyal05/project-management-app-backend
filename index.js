const express = require("express");
const cors = require("cors");
//require("dotenv").config();
const { Pool } = require("pg");


const app = express();
app.use(cors());
app.use(express.json());

console.log("✅ index.js loaded");
// ✅ PostgreSQL Pool (LOCAL)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
// ✅ Home route
app.get("/", (req, res) => res.send("Backend Running ✅"));

// ✅ Test DB route
app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ ok: true, time: result.rows[0] });
  } catch (err) {
  console.log("DB ERROR:", err.message);  
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ✅ Get users
app.get("/users", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ✅ Add new user (Register)
app.post("/users", async (req, res) => {
  try {
    const { name, email, password, role = "user"}  = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ ok: false, error: "name, email, password required" });
    }

// 1️⃣ Insert user
    const result = await pool.query(
      "INSERT INTO users(name,email,password,role) VALUES($1,$2,$3,$4) RETURNING id, name, email, created_at",
      [name, email, password, role || "user"]
    );

  // 2️⃣ If coming via invitation → add into project
   // if (token) {
 // await pool.query(
  "UPDATE projects SET team_members = array_append(team_members, $1) WHERE invite_token = $2",
  //[email, token]
// );
// }

    res.json({
  ok:true,
  user:{
    id: result.rows[0].id,
    name: result.rows[0].name,
    email: result.rows[0].email,
    role: result.rows[0].role
  }
});
  } catch (err) {
    console.error(err);
    if (err.code === "23505") {
    return res.status(400).json({
      ok: false,
      error: "Email already registered"
    });
  }
    res.status(500).json({ ok: false, error: "Server error" });
  }
});

// ✅ Login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ ok: false, error: "email and password required" });
    }

    const result = await pool.query(
      "SELECT * FROM users WHERE email=$1 AND password=$2",
      [email, password]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ ok: false, error: "Invalid email or password" });
    }

const user = result.rows[0];

return res.status(200).json({
  ok: true,
  user: {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  }
});
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ============================
// PROJECT ROUTES
// ============================

// Create Project
app.post("/projects", async (req, res) => {
  try {
    const { title, description, created_by } = req.body;

    if (!title) {
      return res.status(400).json({ ok: false, error: "Title required" });
    }

    const result = await pool.query(
      "INSERT INTO projects(title, description, user_id) VALUES($1,$2,1) RETURNING *",
      [title, description]
    );

    res.json({ ok: true, project: result.rows[0] });
  } catch (err) {
    console.log(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Add member / Invite user
app.post("/projects/:id/add-member", async (req, res) => {
  try {
    const { email } = req.body;
    const projectId = req.params.id;

    const result = await pool.query(
      "UPDATE projects SET team_members = array_append(team_members, $1) WHERE id=$2 RETURNING *",
      [email, projectId]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

// Remove member from project
app.post("/projects/:id/remove-member", async (req, res) => {
  try {
    const { email } = req.body;
    const projectId = req.params.id;

    const result = await pool.query(
      "UPDATE projects SET team_members = array_remove(team_members, $1) WHERE id = $2 RETURNING *",
      [email, projectId]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

// Get All Projects
app.get("/projects", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM projects ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    console.log(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// TEMP route to add project (for testing)
app.get("/test-projects", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM projects");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete project
app.delete("/projects/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query("DELETE FROM projects WHERE id=$1", [id]);

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Update project
app.put("/projects/:id", async (req, res) => {
  const { title, description, status } = req.body;
  const { id } = req.params;

  try {
    const result = await pool.query(
      "UPDATE projects SET title=$1, description=$2, status= $3 WHERE id=$4 RETURNING *",
      [title, description, status, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Update failed" });
  }
});

// Update member role
      app.put("/projects/:id/update-role", async (req, res) => {
  try {
    const { email, role } = req.body;
    const projectId = req.params.id;

    const result = await pool.query(
      "UPDATE projects SET member_roles = jsonb_set(member_roles, $1, $2, true) WHERE id=$3 RETURNING *",
      [`{${email}}`, `"${role}"`, projectId]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

// Create Ticket
app.post("/tickets", async (req, res) => {
  try {
    console.log("BODY:", req.body);

    const { title, description,priority,status, project_id, assigned_to} = req.body;

    const result = await pool.query(
      "INSERT INTO tickets (title, description, project_id,  priority,status, assigned_to) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [title,description,status,project_id,priority,assigned_to] 
       );

    res.status(201).json({
      ok: true,
      ticket: result.rows[0]
    });

  } catch (err) {
    console.log("ERROR:", err);
    res.status(500).json({
      ok: false,
     error: err.message 
     }); 
   }
    });
// GetTickets by Project
app.get("/tickets/project/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;

    const result = await pool.query(
  "SELECT * FROM tickets WHERE project_id= $1 ORDER BY id ASC",
  [projectId]
);

    res.json(result.rows);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error fetching tickets");
  }
});

// DELETE ticket
app.delete("/tickets/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query("DELETE FROM tickets WHERE id=$1", [id]);

    res.json({ message: "Ticket deleted" });
  } catch (err) {
    console.log(err);
    res.status(500).send("Error deleting ticket");
  }
});

// Update Ticket Status
app.put("/tickets/:id", async (req, res) => {
  try {
    const {title, description, status, priority, assigned_to} = req.body;
    const { id } = req.params;

    const result = await pool.query(
      "UPDATE tickets SET title= $1, description=$2, status= $3, priority= $4, assigned_to=$5 WHERE id=$6 RETURNING *",
      [title, description, status, priority,assigned_to, id]
    );

    res.json(result.rows[0]);// ✅ SINGLE ticket
  } catch (err) {
    console.log(err);
    res.status(500).send("Error updating ticket");
  }
});

// UPDATE ticket title & description (EDIT FEATURE)
app.put("/tickets/edit/:id", async (req, res) => {
  try {
    const { title, description } = req.body;
    const { id } = req.params;

    const result = await pool.query(
      "UPDATE tickets SET title=$1, description=$2 WHERE id=$3 RETURNING *",
      [title, description, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).send("Update failed");
  }
});
// dashboard counts
app.get("/dashboard-counts", async (req, res) => {
  try {
    const total = await pool.query("SELECT COUNT(*) FROM projects");
    const pending = await pool.query(
      "SELECT COUNT(*) FROM projects WHERE status='pending'"
    );
    const completed = await pool.query(
      "SELECT COUNT(*) FROM projects WHERE status='completed'"
    );

    res.json({
      total: total.rows[0].count,
      pending: pending.rows[0].count,
      completed: completed.rows[0].count
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

// Add team member to project
app.post("/projects/:id/add-member", async (req, res) => {
  try {
    const { email } = req.body;
    const { id } = req.params;

    const result = await pool.query(
      "UPDATE projects SET team_members = array_append(team_members, $1) WHERE id=$2 RETURNING *",
      [email, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Error adding member" });
  }
});

// =======================
// ADD COMMENT
// =======================
app.post("/comments", async (req, res) => {
  try {
    const { ticket_id, text, author } = req.body;

    const result = await pool.query(
      "INSERT INTO comments (ticket_id, text, author) VALUES ($1,$2,$3) RETURNING id, ticket_id, text, author, created_at",
      [ticket_id, text, author]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.log("COMMENT INSERT ERROR:", err);
    res.status(500).send("Error adding comment");
  }
});


// =======================
// GET COMMENTS BY TICKET
// =======================
app.get("/comments/:ticketId", async (req, res) => {
  try {
    const { ticketId } = req.params;

    const result = await pool.query(
      "SELECT id, ticket_id, text, author, created_at FROM comments WHERE ticket_id=$1 ORDER BY created_at DESC",
      [ticketId]
    );

    res.json(result.rows);
  } catch (err) {
    console.log(err);
    res.status(500).send("Error fetching comments");
  }
});

app.delete("/comments/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM comments WHERE id=$1", [req.params.id]);
    res.json({ message: "deleted" });
  } catch (err) {
    console.log(err);
    res.status(500).send("Error deleting comment");
  }
});

app.listen(5000, () => console.log("Server running on port 5000 ✅"));