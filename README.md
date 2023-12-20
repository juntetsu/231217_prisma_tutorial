---
tags:
  - README.md
---

- [Prisma ドキュメント](#prisma-ドキュメント)
    - [プロジェクト構成](#プロジェクト構成)
  - [プロジェクトの準備（サーバーの立ち上げ）](#プロジェクトの準備サーバーの立ち上げ)
  - [Prisma の初期化](#prisma-の初期化)
  - [RDB 作成(PostgreSQL)](#rdb-作成postgresql)
  - [Prisma と RDB を連携する](#prisma-と-rdb-を連携する)
    - [1. `.env`の`DATABASE_URL`を書き換える](#1-envのdatabase_urlを書き換える)
    - [2. テーブルを作成する](#2-テーブルを作成する)
      - [2-1. Model というものを指定する。](#2-1-model-というものを指定する)
      - [2-2. Model をもとに Migrate する](#2-2-model-をもとに-migrate-する)
      - [2-3. Prisma Studio で DB の中身を確認する](#2-3-prisma-studio-で-db-の中身を確認する)
  - [API を作成する](#api-を作成する)
    - [データを挿入する API](#データを挿入する-api)
    - [データを取得する API](#データを取得する-api)
    - [特定のデータを取得する API](#特定のデータを取得する-api)
    - [データを更新する API](#データを更新する-api)
    - [データを削除する API](#データを削除する-api)

# Prisma ドキュメント

ORM（Object Relational Mapping）  
データベース（RDB）のテーブルを操作するには**SQL**文を知らないといけない。  
(INSERT テーブル名 VALUES ... みたいな)

SQL 文を知らん人向けに、例えば`create()`, `update()`, `delete()`のように、JS のメソッドペースで DB をいじることができる。  
簡単に RDB をいじることができる。これが ORM。

### プロジェクト構成

サーバー：node.js  
データベース（RDB）： PostgreSQL
（サーバーとデータベースを繋ぐのが Prisma）  
クライアント：Postman（API テストのために使う。本来は React とか）

## プロジェクトの準備（サーバーの立ち上げ）

1. `server.js`作成
2. `npm init -y`で package.json 初期化
3. `npm i prisma express nodemon @prisma/client`

"@prisma/client": "^5.7.0",  
"express": "^4.18.2",  
"nodemon": "^3.0.2",  
"prisma": "^5.7.0"

express: node.js のフレームワーク  
nodemon: ローカルサーバーを再起動しやすくするためのもの  
client: データを挿入、削除するために必要なモジュール

<small>`package.json`</small>

```diff
"scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
-   "start": "node server.js"
+   "start": "nodemon server.js"
  },
```

<small>`server.js`</small>

```javascript
// expressモジュールをロードし、インスタンス化してappに代入。
const express = require("express");
const app = express();
const PORT = 8000;

// listen()メソッドを実行して8000番ポートで待ち受け。
app.listen(PORT, () => {
  console.log("サーバーが起動中・・・");
});
```

`npm start`コマンドを流すと

```
> 231217_prisma@1.0.0 start
> nodemon server.js

[nodemon] 3.0.2
[nodemon] to restart at any time, enter `rs`
[nodemon] watching path(s): *.*
[nodemon] watching extensions: js,mjs,cjs,json
[nodemon] starting `node server.js`
サーバーが起動中・・・
```

## Prisma の初期化

`npx prisma init`  
すると自動的に.env ファイルと prisma/schema.prisma が作成される。

<small>`prisma/schema.prisma`</small>

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

## RDB 作成(PostgreSQL)

SQL Shell で作成

1. 初期設定  
   ひたすら Enter でいい（パスワードはちゃんと）

```
Server [localhost]:
Database [postgres]:
Port [5432]:
Username [postgres]:
Password for user postgres:
psql (16.1)
Type "help" for help.

postgres=#
```

2. 既に存在している DB を確認  
   `¥l`（`\l`）

```
postgres=# \l
                                                  List of databases
   Name    |  Owner   | Encoding | Locale Provider | Collate | Ctype | ICU Locale | ICU Rules |   Access privileges
-----------+----------+----------+-----------------+---------+-------+------------+-----------+-----------------------
 postgres  | postgres | UTF8     | libc            | C       | C     |            |           |
 template0 | postgres | UTF8     | libc            | C       | C     |            |           | =c/postgres          +
           |          |          |                 |         |       |            |           | postgres=CTc/postgres
 template1 | postgres | UTF8     | libc            | C       | C     |            |           | =c/postgres          +
           |          |          |                 |         |       |            |           | postgres=CTc/postgres
 users     | postgres | UTF8     | libc            | C       | C     |            |           |
(4 rows)
```

3. 新しい DB 作成  
   `CREATE DATABASE [データベース名];`  
   今回は"sampledb"という DB を作成する。

```
postgres=# CREATE DATABASE sampledb;
CREATE DATABASE
```

`\l`で作成されたか確認

4. 作成した DB にアクセス  
   `\c [データベース名]`

```
postgres=# \c sampledb
You are now connected to database "sampledb" as user "postgres".
```

5. テーブルを作成  
   SQL Shell で作成できるが、Prisma を使って作成していく。（VScode）

## Prisma と RDB を連携する

### 1. `.env`の`DATABASE_URL`を書き換える

`DATABASE_URL="postgresql://[ユーザー名]:[パスワード]@localhost:5432/[DB名]?schema=public"`  
↓  
`DATABASE_URL="postgresql://postgres:xxxxxxxxxxxx@localhost:5432/sampledb?schema=public"`

### 2. テーブルを作成する

#### 2-1. Model というものを指定する。

<small>`prisma/schema.prisma`</small>

```prisma
model Posts {
  // autoincrement()という関数を使うことで、自動的にIDがインクリメントされるようになる
  id Int @default(autoincrement()) @id
  title String
  content String
  // now()という関数を使うことで、現在時刻が自動的に入るようになる
  createdAt  DateTime @default(now())
}
```

色々な型があるので[公式](https://www.prisma.io/docs/orm/prisma-schema/data-model/models#defining-fields)を見ると良い

#### 2-2. Model をもとに Migrate する

`npx prisma migrate dev --name init`  
マイグレートすることで、Model（ここでは Posts）をもとにテーブルを作成する。

作成が完了すると`Your database is now in sync with your schema.`と表示される  
また、`prisma` ディレクトリに新たに `migrations` ディレクトリが作成され、中身を確認すると`migration.sql`がある。（SQL 文）

```sql
-- CreateTable
CREATE TABLE "Posts" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Posts_pkey" PRIMARY KEY ("id")
);
```

#### 2-3. Prisma Studio で DB の中身を確認する

`npx prisma studio`

自動的にブラウザが立ち上がって、DB の中身を確認できる。

## API を作成する

クライアントから create()や delete()などのリクエストが発生した際に、サーバー側の API を通じて DB にアクセスする。  
今からその API を作成する。  
（`npm start`でサーバーは立ち上げた状態）

### データを挿入する API

<small>`server.js`</small>

```javascript
const { PrismaClient } = require("@prisma/client");
...
const prisma = new PrismaClient();

// json形式のデータを受け取れるようにするミドルウェア設定（postより前に書く）
app.use(express.json());

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

...
```

[公式ドキュメント](https://www.prisma.io/docs/orm/prisma-client/queries/crud#create)

GET ではなく POST なので、Postman を使って挿入してみる。  
Postman の使い方は[Youtube](https://www.youtube.com/watch?v=9mE1j1vzUAQ&t=832s)の 28:00〜

挿入したら Prisma Studio で確認してみる。  
[Youtube](https://www.youtube.com/watch?v=9mE1j1vzUAQ&t=832s)32:00〜

### データを取得する API

<small>`server.js`</small>

```javascript
app.get("/", async (req, res) => {
  // 記事を全件取得する
  const posts = await prisma.posts.findMany();
  // json形式で返す
  return res.json(posts);
});
```

### 特定のデータを取得する API

<small>`server.js`</small>

```javascript
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
```

### データを更新する API

<small>`server.js`</small>

```javascript
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
```

### データを削除する API

<small>`server.js`</small>

```javascript
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
```
