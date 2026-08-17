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

async function getAllIdea(user_id = null, searchQuery = "") {
  let query = `
    SELECT 
      i.id, 
      i.user_id, 
      i.title, 
      i.description, 
      COALESCE((SELECT COUNT(*)::int FROM idea_likes il WHERE il.idea_id = i.id), i.likes) AS likes,
      i.created_at,
      u.username AS author_name,
      COALESCE((SELECT EXISTS(SELECT 1 FROM idea_likes il WHERE il.idea_id = i.id AND il.user_id = $1)), false) AS is_liked,
      COALESCE((SELECT EXISTS(SELECT 1 FROM saves s WHERE s.idea_id = i.id AND s.user_id = $1)), false) AS is_saved,
      COALESCE(
        (SELECT json_agg(t.tags) FROM tags t WHERE t.idea_id = i.id),
        '[]'::json
      ) AS tags
    FROM ideas i
    LEFT JOIN users u ON i.user_id = u.id
  `;

  const values = [user_id];

  if (searchQuery && searchQuery.trim() !== "") {
    query += ` WHERE i.title ILIKE $2 OR i.description ILIKE $2 OR EXISTS (
      SELECT 1 FROM tags t WHERE t.idea_id = i.id AND t.tags ILIKE $2
    )`;
    values.push(`%${searchQuery.trim()}%`);
  }

  query += ` ORDER BY i.created_at DESC`;

  const result = await db.query(query, values);
  return result.rows;
}

async function getUserIdeas(user_id) {
  const query = `
    SELECT 
      i.id, 
      i.user_id, 
      i.title, 
      i.description, 
      COALESCE((SELECT COUNT(*)::int FROM idea_likes il WHERE il.idea_id = i.id), i.likes) AS likes,
      i.created_at,
      u.username AS author_name,
      COALESCE((SELECT EXISTS(SELECT 1 FROM idea_likes il WHERE il.idea_id = i.id AND il.user_id = $1)), false) AS is_liked,
      COALESCE((SELECT EXISTS(SELECT 1 FROM saves s WHERE s.idea_id = i.id AND s.user_id = $1)), false) AS is_saved,
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
      COALESCE((SELECT COUNT(*)::int FROM idea_likes il WHERE il.idea_id = i.id), i.likes) AS likes,
      i.created_at,
      u.username AS author_name,
      COALESCE((SELECT EXISTS(SELECT 1 FROM idea_likes il WHERE il.idea_id = i.id AND il.user_id = $1)), false) AS is_liked,
      true AS is_saved,
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

async function toggleLike(user_id, idea_id) {
  // Check if already liked by this user
  const checkQuery = `SELECT id FROM idea_likes WHERE user_id = $1 AND idea_id = $2`;
  const checkResult = await db.query(checkQuery, [user_id, idea_id]);

  let isLiked = false;

  if (checkResult.rows.length > 0) {
    // Already liked -> Remove like (Unlike)
    await db.query(`DELETE FROM idea_likes WHERE user_id = $1 AND idea_id = $2`, [user_id, idea_id]);
    await db.query(`UPDATE ideas SET likes = GREATEST(0, likes - 1) WHERE id = $1`, [idea_id]);
    isLiked = false;
  } else {
    // Not liked -> Add like
    await db.query(`INSERT INTO idea_likes (user_id, idea_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [user_id, idea_id]);
    await db.query(`UPDATE ideas SET likes = likes + 1 WHERE id = $1`, [idea_id]);
    isLiked = true;
  }

  // Fetch updated total likes count
  const countResult = await db.query(
    `SELECT COALESCE((SELECT COUNT(*)::int FROM idea_likes WHERE idea_id = $1), (SELECT likes FROM ideas WHERE id = $1)) AS likes`,
    [idea_id]
  );
  const likesCount = parseInt(countResult.rows[0]?.likes || 0, 10);

  return {
    id: idea_id,
    likes: likesCount,
    is_liked: isLiked,
  };
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
