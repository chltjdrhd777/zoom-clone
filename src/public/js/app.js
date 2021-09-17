//@ io 사용법
//# 백엔드 서버에서 html을 받을 때에 script 전역으로 io의 중개서비스를 받아오고 있다.
//# 이 정보를 바탕으로 서버와 연결한다

const socket = io();
const welcome = document.querySelector("#welcome");
const welcomForm = welcome.querySelector("form");

const room = document.querySelector("#room");
const h3 = room.querySelector("h3");
const ul = room.querySelector("ul");
const roomForm = room.querySelector("form");

room.hidden = true;
let roomName;

function backendDone() {
  room.hidden = false;
  welcome.hidden = true;
  h3.textContent = roomName;
}

function addMessage(message) {
  const li = document.createElement("li");
  li.textContent = message;
  ul.appendChild(li);
}

function handleWelcomeSubmit(e) {
  e.preventDefault();
  const input = welcomForm.querySelector("input");
  //1. emit시에 타입정의하듯 첫째인자를 정함
  //2. 전달시 형식을 바꿀필요없이 알아서 socket이 바꿔줌
  //3. emit은 여러개의 arguments를 받을 수 있음. 종류는 제한이 없으나 함수를 넣고 싶다면 마지막에 넣어야 함
  //4. 마지막에 넣어진 함수는 마치 비동기마냥 사용할 수 있음. 무슨말이냐면,
  //5. 앞에서 전달된 모든 arguments들을 처리하고 서버에서 마지막 요소를 실행하면, 마치 서버가 클라이언트한테 요청하는것마냥 요청해서 클라이언트측에 존재하는 그 함수가 실행됨
  //6. 비동기의 실행을 이렇게 해놨음 어썸함
  socket.emit("enter_room", input.value, backendDone);
  roomName = input.value;
  input.value = "";
}

function handleRoomSubmit(e) {
  e.preventDefault();
  const li = document.createElement("li");
  const input = room.querySelector("input");
  socket.emit(
    "newMessage",
    roomName,
    input.value,
    addMessage(`YOU : ${input.value}`)
  );
  input.value = "";
}

welcomForm.addEventListener("submit", handleWelcomeSubmit);
roomForm.addEventListener("submit", handleRoomSubmit);
//@ on event 확인///

socket.on("greeting", (id) => {
  addMessage(`someone entered : ${id}`);
});

socket.on("bye", (id) => {
  addMessage(`someone left : ${id}`);
});

socket.on("chat", (msg, id) => {
  addMessage(`${id} : ${msg}`);
});

// // 브라우저쪽 html을 살펴보면, 거기에서 해당 경로에 있는 js 파일을 요청한다.
// // 서버가 이 js 파일을 보내면, 브라우저가 이것을 가지고 실행한다
// // 그러면, 그 내부에 현재 socket이라는 상수에 websoket을 이용한 객체를 만들고, 변수로 저 url을 전달하는데
// // 이때 request가 발생하면서 "hey, 우리의 커넥션을 이제 ws로 바꿀 때가 되었어. 업그레이드해" 하고 헤더에 달아서 요청한다

// //그럼 서버입장에서는 이제 해당 요청에 따른 브라우저에서 만들어진 객체를 받아와서 server.js에 있던 websocket server에 저장한다
// //이것을 on이라는 메소드로 감지하여, 내부 내용에 "connection"을 확인하여 연결이 된 것을 보면, 콜백함수를 통해서 할 수 있는 내용을 정의한다
// //이때 콜백함수로 브라우저에 저장되고 있는 객체를 받아 건들 수 있다. 즉, socket이라는 인자로 받아오는 객체를 통해 브라우저에게 직접 소통할 수 있다.
// //예를들어, socket.send로 보내고 싶은 내용을 객체형태의 json 포멧으로 담아 보낼 수 있다는 소리다
// //반대로 클라이언트쪽에서는 계속해서 받아왔던 socket 객체를 가지고 있고, 서버가 뭔가를 보내올때마다 그 객체에 있는 내용물들이 바뀌게 된다
// // 이것은 addEventListner을 통해 감지하여, 내용물에 따라 여러가지를 할 수 있다.

// // 말 그대로, 살아있는 서버가 된 것이다. 서버는 클라이언트의 요청에 답변만 해주는 것이 아닌, 직접 클라이언트에게 관여를 할 수 있게 되었다는 뜻이다.
// // 여담으로, 서버쪽에 있는 socket으로 사용하는 on 메소드는 기존의 브라우저가 서버한테 요청하는 것과 비슷한 행동이다

// const messageUl = document.querySelector("ul");

// const messageForm = document.querySelector("#message");
// const nickForm = document.querySelector("#nick");

// const socket = new WebSocket(`ws://${window.location.host}`);

// function makeMessage(type, payload) {
//   const msg = { type, payload };
//   return JSON.stringify(msg);
// }

// socket.addEventListener("open", () => {
//   console.log("it is connected to my server");
// });

// socket.addEventListener("message", (message) => {
//   const li = document.createElement("li");
//   li.textContent = message.data;
//   messageUl.append(li);
// });

// socket.addEventListener("close", () => {
//   console.log("disconnected");
// });

// function handleNickSubmit(e) {
//   e.preventDefault();
//   const input = nickForm.querySelector("input");
//   socket.send(makeMessage("nickname", input.value));
//   input.value = "";
// }

// function handleMessageSubmit(e) {
//   e.preventDefault();
//   const input = messageForm.querySelector("input");
//   socket.send(makeMessage("new_message", input.value));
//   const li = document.createElement("li");
//   li.textContent = `you : ${input.value}`;
//   messageUl.append(li);

//   input.value = "";
// }

// nickForm.addEventListener("submit", handleNickSubmit);
// messageForm.addEventListener("submit", handleMessageSubmit);
