import db from "../database/db.js";

async function createIdea(user_id, title, description) {
  const query = `
    INSERT INTO ideas (user_id, title, description)
    VALUES ($1, $2, $3)
    RETURNING id
  `;

  const values = [user_id, title, description];

  const result = await db.query(query, values);

  return result.rows[0];
}

async function addTags(idea_id, user_id, tags) {
  for (const tagName of tags) {
    await db.query(
      `
      INSERT INTO tags (idea_id, user_id, tags)
      VALUES ($1, $2, $3)
      `,
      [idea_id, user_id, tagName],
    );
  }
}

async function getAllIdea() {
  const query = `
    SELECT id, user_id, title, description, likes
    FROM ideas
    ORDER BY id DESC
  `;

  const result = await db.query(query);

  return result.rows;
}

async function getAllTagsAccordingToIdea(user_id) {
  const query = `
    SELECT tags
    FROM tags
    WHERE user_id = $1
  `;

  const values = [user_id];

  const result = await db.query(query, values);

  return result.rows;
}

export { createIdea, addTags, getAllIdea, getAllTagsAccordingToIdea };
