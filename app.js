import express from "express";
import mysql from "mysql2/promise";
import cors from "cors";

const pool = mysql.createPool({
  host: "localhost",
  user: "jkjkhh",
  password: "sbs123414",
  database: "wise_saying_app_2022_05_26",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
});

const app = express();
app.use(express.json());

app.use(cors());

const port = 3000;

app.patch("/wisesayings/:id", async (req, res) => {
  const { id } = req.params;
  const [[wiseSayingRow]] = await pool.query(
    `
    SELECT *
    FROM wise_saying
    WHERE id = ?
    `,
    [id]
  );

  if (wiseSayingRow === undefined) {
    res.status(404).json({
      resultCode: "F-1",
      msg: "404 not found",
    });
    return;
  }

  const {
    content = wiseSayingRow.content,
    author = wiseSayingRow.author,
    goodLikeCount = wiseSayingRow.goodLikeCount,
    badLikeCount = wiseSayingRow.badLikeCount,
  } = req.body;

  await pool.query(
    `
    UPDATE wise_saying
    SET content = ?,
    author = ?, 
    goodLikeCount = ?, 
    badLikeCount = ?
    WHERE id = ?
    `,
    [content, author, goodLikeCount, badLikeCount, id]
  );

  const [[justModifiedWiseSayingRow]] = await pool.query(
    `
    SELECT *
    FROM wise_saying
    WHERE id = ?
    `,
    [id]
  );

  res.json({
    resultCode: "S-1",
    msg: "성공",
    data: justModifiedWiseSayingRow,
  });
});

app.get("/wisesayings/random", async (req, res) => {
  const [[wiseSayingRow]] = await pool.query(
    `
    SELECT *
    FROM wise_saying
    ORDER BY RAND()
    LIMIT 1
    `
  );

  if (wiseSayingRow === undefined) {
    res.status(404).json({
      resultCode: "F-1",
      msg: "404 not found",
    });
    return;
  }

  wiseSayingRow.hitCount++;

  await pool.query(
    `
    UPDATE wise_saying
    SET hitCount = ?
    WHERE id = ?
    `,
    [wiseSayingRow.hitCount, wiseSayingRow.id]
  );

  res.json({
    resultCode: "S-1",
    msg: "성공",
    data: wiseSayingRow,
  });
});

app.listen(port, () => {
  console.log(`Wise Saying app listening on port ${port}`);
});
