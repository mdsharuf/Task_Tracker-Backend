const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// In-memory "DB"
let tasks = [];
let nextId = 1;

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// GET all tasks
app.get("/api/tasks", (req, res) => {
  // sort by created_at desc (optional)
  const sorted = [...tasks].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );
  res.json(sorted);
});

// CREATE task
app.post("/api/tasks", (req, res) => {
  const { title, description } = req.body;

  if (!title) {
    return res.status(400).json({ error: "Title required" });
  }

  const newTask = {
    id: nextId++,
    title,
    description: description || null,
    completed: false,
    created_at: new Date().toISOString(),
  };

  tasks.push(newTask);
  res.status(201).json(newTask);
});

// UPDATE task
app.put("/api/tasks/:id", (req, res) => {
  const id = Number(req.params.id);
  const { title, description } = req.body;

  if (!title) {
    return res.status(400).json({ error: "Title required" });
  }

  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Task not found" });
  }

  tasks[index] = {
    ...tasks[index],
    title,
    description: description ?? tasks[index].description,
  };

  res.json(tasks[index]);
});

// TOGGLE task
app.patch("/api/tasks/:id/toggle", (req, res) => {
  const id = Number(req.params.id);

  const task = tasks.find((t) => t.id === id);
  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }

  task.completed = !task.completed;
  res.json(task);
});

// DELETE task
app.delete("/api/tasks/:id", (req, res) => {
  const id = Number(req.params.id);

  const beforeLen = tasks.length;
  tasks = tasks.filter((t) => t.id !== id);

  if (tasks.length === beforeLen) {
    return res.status(404).json({ error: "Task not found" });
  }

  res.status(204).send();
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Server running on port ${port}`));

