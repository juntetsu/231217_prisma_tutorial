// expressモジュールをロードし、インスタンス化してappに代入。
const express = require("express");
const app = express();
const PORT = 8000;

// listen()メソッドを実行して8000番ポートで待ち受け。
app.listen(PORT, () => {
  console.log("サーバーが起動中・・・");
});
