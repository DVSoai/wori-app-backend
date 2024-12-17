import { Request, Response } from "express";
import pool from "../models/db";
import { error, log } from "console";

export const fetchAllConversationsByUserId = async (
  req: Request,
  res: Response
) => {
  let userId = null;
  if (req.user) {
    userId = req.user.id;
  }
  console.log(userId);
  try {
    // const result = await pool.query(
    //   `
    //   SELECT c.id AS conversation_id, u.username AS participant_name, m.content AS last_message, m.created_at AS last_message_time
    //         FROM conversations c
    //         JOIN users u ON (u.id = c.participant_two AND u.id != $1)
    //         LEFT JOIN LATERAL (
    //             SELECT content, created_at
    //             FROM messages
    //             WHERE conversation_id = c.id
    //             ORDER BY created_at DESC
    //             LIMIT 1
    //         ) m ON true
    //          WHERE c.participant_one = $1 OR c.participant_two = $1
    //          ORDER BY m.created_at DESC
    //          `,
    //   [userId]
    // );

    const result = await pool.query(
      `SELECT c.id AS conversation_id,
                  u.username AS participant_name,
                  m.content AS last_message,
                  m.created_at AS last_message_time
           FROM conversations c
           JOIN users u ON u.id IN (c.participant_one, c.participant_two) AND u.id != $1
           LEFT JOIN LATERAL (
               SELECT content, created_at
               FROM messages
               WHERE conversation_id = c.id
               ORDER BY created_at DESC
               LIMIT 1
           ) m ON true
           WHERE c.participant_one = $1 OR c.participant_two = $1
           ORDER BY m.created_at DESC`,
      [userId]
    );

    res.json(result.rows);

    // router.get("/", verifyToken, async (req: Request, res: Response) => {
    //   let userId = null;
    //   if (req.user) {
    //     userId = req.user.id; // Đảm bảo userId được xác định chính xác
    //   }
    //   console.log("User ID:", userId); // Log giá trị userId để kiểm tra
    //   try {
    //     const result = await pool.query(
    //       `SELECT c.id AS conversation_id,
    //               u.username AS participant_name,
    //               m.content AS last_message,
    //               m.created_at AS last_message_time
    //        FROM conversations c
    //        JOIN users u ON u.id IN (c.participant_one, c.participant_two) AND u.id != $1
    //        LEFT JOIN LATERAL (
    //            SELECT content, created_at
    //            FROM messages
    //            WHERE conversation_id = c.id
    //            ORDER BY created_at DESC
    //            LIMIT 1
    //        ) m ON true
    //        WHERE c.participant_one = $1 OR c.participant_two = $1
    //        ORDER BY m.created_at DESC`,
    //       [userId]
    //     );
    //     console.log(result.rows);
    //     res.json(result.rows);
    //   } catch (e) {
    //     console.log(e);
    //     res.status(500).json({ error: e });
    //   }
    // });
  } catch (e) {
    console.log(e);
  }
};

export const checkOrCreateConversation = async (
  req: Request,
  res: Response
): Promise<any> => {
  let userId = null;
  if (req.user) {
    userId = req.user.id;
  }
  const { contactId } = req.body;
  try {
    const existingConversation = await pool.query(
      `
      SELECT id FROM conversations 
      WHERE (participant_one = $1 AND participant_two = $2)
      OR (participant_one = $2 AND participant_two = $1)
      LIMIT 1;
      `,
      [userId, contactId]
    );
    if (
      existingConversation.rowCount != null &&
      existingConversation.rowCount! > 0
    ) {
      return res.json({ conversationId: existingConversation.rows[0].id });
    }

    const newConversation = await pool.query(
      `
      INSERT INTO conversations (participant_one, participant_two)
      VALUES ($1, $2)
      RETURNING id;
      `,
      [userId, contactId]
    );
    return res.json({ conversationId: newConversation.rows[0].id });
  } catch (error) {
    console.error("Error checking or creating conversation:", error);
    res.status(500).json({ error: "Failed to check or create conversation" });
  }
};

export const getDailyQuestion = async (
  req: Request,
  res: Response
): Promise<any> => {
  const conversationId = req.params.id;
  console.log("Conversation ID:", conversationId);
  const AI_BOT_ID = process.env.AI_BOT_ID;
  try {
    const result = await pool.query(
      `
      SELECT content FROM messages
      WHERE conversation_id = $1 AND sender_id = $2
      ORDER BY created_at DESC
      LIMIT 1
      `,
      [conversationId, AI_BOT_ID]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "No daily question found" });
    }
    res.json({ question: result.rows[0].content });
  } catch (error) {
    console.error(`Error fetching daily question: ${error}`);
    res.status(500).json({ error: "Failed to fetch daily question" });
  }
};
