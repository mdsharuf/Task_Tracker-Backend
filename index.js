require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// GET all tasks
app.get("/api/tasks", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM tasks ORDER BY created_at DESC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});

// CREATE task
app.post("/api/tasks", async (req, res) => {
  const { title, description } = req.body;
  if (!title) return res.status(400).json({ error: "Title required" });

  try {
    const [result] = await pool.query(
      "INSERT INTO tasks (title, description) VALUES (?,?)",
      [title, description || null]
    );
    res.status(201).json({ id: result.insertId, title, description });
  } catch {
    res.status(500).json({ error: "DB insert failed" });
  }
});

// UPDATE task
app.put("/api/tasks/:id", async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;

  if (!title) return res.status(400).json({ error: "Title required" });

  try {
    await pool.query("UPDATE tasks SET title=?, description=? WHERE id=?", [title, description, id]);
    res.json({ id, title, description });
  } catch {
    res.status(500).json({ error: "DB update failed" });
  }
});

// TOGGLE task
app.patch("/api/tasks/:id/toggle", async (req, res) => {
  const { id } = req.params;

  await pool.query("UPDATE tasks SET completed = NOT completed WHERE id = ?", [id]);

  const [rows] = await pool.query("SELECT * FROM tasks WHERE id=?", [id]);
  res.json(rows[0]);
});

// DELETE task
app.delete("/api/tasks/:id", async (req, res) => {
  await pool.query("DELETE FROM tasks WHERE id=?", [req.params.id]);
  res.status(204).send();
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Server running on port ${port}`));
