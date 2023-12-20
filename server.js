const { PrismaClient } = require("@prisma/client");
const express = require("express");
const app = express();
const PORT = 8000;

const prisma = new PrismaClient();

// json形式のデータを受け取れるようにするミドルウェア設定（postより前に書く）
app.use(express.json());

// 記事を全件取得するAPI
app.get("/", async (req, res) => {
  // 記事を全件取得する
  const posts = await prisma.posts.findMany();
  // json形式で返す
  return res.json(posts);
});

// 特定の記事を取得するAPI
app.get("/:id", async (req, res) => {
  // 記事のidを取得する
  const id = req.params.id;

  // idが一致するものを取得する
  const post = await prisma.posts.findUnique({
    where: {
      id: Number(id), // idは数値型なのでNumber()で数値型に変換する
    },
  });
  // json形式で返す
  return res.json(post);
});

// 記事を作成するAPI
app.post("/", async (req, res) => {
  // タイトルと本文を挿入する
  const { title, content } = req.body;
  // Model名がPostsなのでprisma.posts,もしUserならprisma.user
  // 記事の作成なのでcreate()メソッド
  const posts = await prisma.posts.create({
    data: {
      title: title,
      content: content,
    },
  });

  // json形式で返す
  return res.json(posts);
});

// 記事を更新するAPI
app.put("/:id", async (req, res) => {
  // 記事のidを取得する
  const id = req.params.id;
  // 本文を取得する
  const { content } = req.body;

  // idが一致するものを更新する
  const updatePosts = await prisma.posts.update({
    where: {
      id: Number(id), // idは数値型なのでNumber()で数値型に変換する
    },
    // 更新する内容
    data: {
      content: content,
    },
  });

  // json形式で返す
  return res.json(updatePosts);
});

// 記事を削除するAPI
app.delete("/:id", async (req, res) => {
  const id = req.params.id;

  // idが一致するものを削除する
  const deletePosts = await prisma.posts.delete({
    where: {
      id: Number(id),
    },
  });

  return res.json(deletePosts);
});

// listen()メソッドを実行して8000番ポートで待ち受け。
app.listen(PORT, () => {
  console.log("サーバーが起動中・・・");
});
