import db from '../config/db.js';

export const getDashboardSummary = async (req, res) => {
  try {
    // simple example: count projects and tasks (adjust to your schema)
    const projects = await db.query('SELECT COUNT(*)::int AS count FROM projects');
    const tasks = await db.query('SELECT COUNT(*)::int AS count FROM tasks');
    res.json({ projects: projects.rows[0].count, tasks: tasks.rows[0].count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAllProjects = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM projects ORDER BY id DESC');
    res.json({ projects: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getProjectById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('SELECT * FROM projects WHERE id = $1', [id]);
    if (!result.rows.length) return res.status(404).json({ message: 'Not found' });
    res.json({ project: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};