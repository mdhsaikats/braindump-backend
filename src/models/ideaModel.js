import db from "../database/db";

async function createIdea(user_id, title, description) {
  const query = `INSERT INTO (title,description) VALUES ($1,$2) WHERE id = $3 RETURNING id`;
  const values = [title, description, user_id];
  const result = await db.query(query, values);
  return result.rows[0];
}

async function addTags(post_id, tags) {
  for (const tagName of tags) {
    const tagResult = await db.query(
      `
            INSERT INTO tags (name)
            VALUES ($1)
            ON CONFLICT (name)
            DO UPDATE SET name = EXCLUDED.name
            RETURNING id
            `,
      [tagName],
    );

    const tag_id = tagResult.rows[0].id;

    await db.query(
      `
            INSERT INTO post_tags (post_id, tag_id)
            VALUES ($1, $2)
            ON CONFLICT DO NOTHING
            `,
      [post_id, tag_id],
    );
  }
}

export { createIdea, addTags };
