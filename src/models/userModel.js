import db from "../database/db.js";

async function createUser(username, email, passwordHash) {
    const query = `INSERT INTO users (username,email,password_hash) VALUES ($1, $2, $3);`;
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
    const query = `SELECT name , email , created_at FROM users WHERE id = $1`;
    const values = [user_id];
    const result = await db.query(query, values);
    return result.rows[0];
}

async function updateUserProfile(user_id, name, email) {
    const query = `
        UPDATE users
        SET name = $1, email = $2
        WHERE id = $3
        RETURNING id, name, email
    `;
    const values = [name, email, user_id];
    const result = await db.query(query, values);
    return result.rows[0];
}

export { createUser, verifyEmail, verifyUser, getUserProfile, updateUserProfile };