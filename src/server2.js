//# realtime communication with socketIO
//@ 큰 특징은, 이것은 프레임워크이고, webSocket을 쓰기는 하지만 만약에 저것이 사용불가능한 상황이면 다른 대처법을 사용하는 패키지다.
//@ 또한, 각종 리얼타임 커뮤니케이션을 위한 편리한 메소드들을 구현해놓은 패키지이다.
//@ 밑에는 그것을 테스트해본다

import express from "express";
import http from "http";
import socketIO from "socket.io";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));

app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

//! server
const server = http.createServer(app);
const ioServer = socketIO(server);

ioServer.on("connection", (socket) => {
  socket.on("enter_room", (roomName, done) => {
    // join => 말 그대로 set에다가 객체를 방처럼 만드는 것과 같다.
    // 거기 안에 들어가 있는 것은 각각의 소캣아이디들이다
    // 소켓아이디는 소캣의 그 자체를 대표하며,
    // 소캣 아이디들을 가지고 있다는 것은 각 소캣객체들에게 무언가를 실행할 수 있다는 뜻이다.
    socket.join(roomName);
    done();

    // roomname의 객체안에 들어가있는 값들을 조회하여, 각 소캣에게 emit하는 메소드를 실행한다.
    // 이때 emit에 대한 내용은 우리가 정의하는 이벤트타입이다(마치 클라이언트측에서 enter_room 형태로 요청을 보낸 것처럼)
    // 중요한점은, 알아서 room객체 내에서 나의 아이디를 제외하고 다른 아이디에만 emit 메소드를 실행한다는 점을 기억하자.
    socket.to(roomName).emit("greeting", socket.id);
  });

  // 클라이언트측에서 브라우저 탭을 끄거나 할 때에,
  // 자동으로 서버쪽에 disconnecting 요청을 전달한다
  // 서버는 이것을 on으로 인지할 수 있으므로, 인지되는 순간 콜백함수를 실행시킨다.
  // 클라이언트측에는 bye라는 타입의 키워드를 전송할 것이다.
  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) => socket.to(room).emit("bye", socket.id));
  });

  socket.on("newMessage", (roomName, msg) => {
    socket.to(roomName).emit("chat", msg, socket.id);
  });
});

server.listen(8080, () => console.log("connected"));
