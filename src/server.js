//# it is pure web socket test.

// import express from "express";
// import http from "http";
// import WebSoket from "ws";

// const app = express();
// app.set("view engine", "pug");
// app.set("views", __dirname + "/views");
// app.use("/public", express.static(__dirname + "/public"));

// app.get("/", (_, res) => res.render("home"));
// app.get("/*", (_, res) => res.redirect("/"));

// // app.listen(3000, "localhost", () => console.log("Listing on localhost:3000"));
// // node.js 설치때 그 내부에 정의된 객체 http를 사용한다
// // createServer의 내부 정의를 보면, request와 response를 다룰 수 있는 객체를 인자로 받고있다.
// // 우리가 변수 app에 설정한 것은 express를 호출한 결과물이고, express를 호출하면 딱 절묘하게 request와 response 객체를 담고 있는 객체를 리턴한다.

// // 해당 변수에 담아주면, createServer가 리턴하는 서버객체를 받을 수 있다.
// // 그말인 즉슨, 이제 그 서버객체에 접근하여 ws를 연결시킬 수 있다는 소리가 된다.
// const server = http.createServer(app); //@ only http만 돌아가는 서버객체지만
// const wsServer = new WebSoket.Server({ server }); //! 이렇게 함으로써 해당 http 객체를 다루는 서버객체에, ws기능을 추가할 수 있다. 왜냐면 현재 저 객체는 레퍼런스 형태이기 때문.

// const sockets = [];

// wsServer.on("connection", (socket) => {
//   //console.log(socket);
//   socket["nickname"] = "Anon";
//   sockets.push(socket);

//   socket.on("message", (message) => {
//     const { type, payload } = JSON.parse(message.toString("utf8"));

//     if (type === "nickname") {
//       socket["nickname"] = payload;
//     }

//     if (type === "new_message") {
//       sockets.forEach((aSocket) =>
//         aSocket.send(`${socket.nickname}: ${payload}`)
//       );
//     }
//   });
// });

// server.listen(3000, () => console.log("listening port 3000"));
