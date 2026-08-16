import db from "../database/db.js";

async function createUser(username, email, passwordHash) {
  const query = `INSERT INTO users (username,email,password_hash) VALUES ($1, $2, $3) RETURNING id;`;
  const values = [username, email, passwordHash];
  const result = await db.query(query, values);
  return result.rows[0];
}

async function verifyEmail(email) {
  const query = `SELECT email FROM users WHERE email = $1`;
  const values = [email];
  const result = await db.query(query, values);
  return result.rows.length > 0;
}

async function verifyUser(email) {
  const query = `
        SELECT id,password_hash
        FROM users
        WHERE email = $1
    `;
  const values = [email];
  const result = await db.query(query, values);
  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
}

async function getUserProfile(user_id) {
  const query = `SELECT username , email ,bio, created_at FROM users WHERE id = $1`;
  const values = [user_id];
  const result = await db.query(query, values);
  return result.rows[0];
}

async function updateUserProfile(user_id, username, email, bio) {
  const query = `
        UPDATE users
        SET username = $1, email = $2,bio = $3
        WHERE id = $4
        RETURNING id, username, email,bio
    `;
  const values = [username, email, bio, user_id];
  const result = await db.query(query, values);
  return result.rows[0];
}

export {
  createUser,
  verifyEmail,
  verifyUser,
  getUserProfile,
  updateUserProfile,
};
