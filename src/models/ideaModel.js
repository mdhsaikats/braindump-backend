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
    SELECT 
      i.id, 
      i.user_id, 
      i.title, 
      i.description, 
      i.likes,
      i.created_at,
      u.username AS author_name,
      COALESCE(
        (SELECT json_agg(t.tags) FROM tags t WHERE t.idea_id = i.id),
        '[]'::json
      ) AS tags
    FROM ideas i
    LEFT JOIN users u ON i.user_id = u.id
    ORDER BY i.created_at DESC
  `;

  const result = await db.query(query);
  return result.rows;
}

async function getUserIdeas(user_id) {
  const query = `
    SELECT 
      i.id, 
      i.user_id, 
      i.title, 
      i.description, 
      i.likes,
      i.created_at,
      u.username AS author_name,
      COALESCE(
        (SELECT json_agg(t.tags) FROM tags t WHERE t.idea_id = i.id),
        '[]'::json
      ) AS tags
    FROM ideas i
    LEFT JOIN users u ON i.user_id = u.id
    WHERE i.user_id = $1
    ORDER BY i.created_at DESC
  `;

  const result = await db.query(query, [user_id]);
  return result.rows;
}

async function deleteIdea(idea_id, user_id) {
  const query = `
    DELETE FROM ideas
    WHERE id = $1 AND user_id = $2
    RETURNING id
  `;

  const result = await db.query(query, [idea_id, user_id]);
  return result.rows[0];
}

async function saveIdea(user_id, idea_id) {
  const query = `
    INSERT INTO saves (user_id, idea_id)
    VALUES ($1, $2)
    ON CONFLICT DO NOTHING
    RETURNING id
  `;

  const result = await db.query(query, [user_id, idea_id]);
  return result.rows[0];
}

async function unsaveIdea(user_id, idea_id) {
  const query = `
    DELETE FROM saves
    WHERE user_id = $1 AND idea_id = $2
    RETURNING id
  `;

  const result = await db.query(query, [user_id, idea_id]);
  return result.rows[0];
}

async function getUserSavedIdeas(user_id) {
  const query = `
    SELECT 
      i.id, 
      i.user_id, 
      i.title, 
      i.description, 
      i.likes,
      i.created_at,
      u.username AS author_name,
      COALESCE(
        (SELECT json_agg(t.tags) FROM tags t WHERE t.idea_id = i.id),
        '[]'::json
      ) AS tags
    FROM saves s
    JOIN ideas i ON s.idea_id = i.id
    LEFT JOIN users u ON i.user_id = u.id
    WHERE s.user_id = $1
    ORDER BY s.created_at DESC
  `;

  const result = await db.query(query, [user_id]);
  return result.rows;
}

async function toggleLike(idea_id) {
  const query = `
    UPDATE ideas
    SET likes = likes + 1
    WHERE id = $1
    RETURNING id, likes
  `;

  const result = await db.query(query, [idea_id]);
  return result.rows[0];
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

export { 
  createIdea, 
  addTags, 
  getAllIdea, 
  getUserIdeas, 
  deleteIdea, 
  saveIdea, 
  unsaveIdea, 
  getUserSavedIdeas, 
  toggleLike, 
  getAllTagsAccordingToIdea 
};
