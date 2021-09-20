//@ io 사용법
//# 백엔드 서버에서 html을 받을 때에 script 전역으로 io의 중개서비스를 받아오고 있다.
//# 이 정보를 바탕으로 서버와 연결한다

const socket = io();
const welcome = document.querySelector("#welcome");
const welcomForm = welcome.querySelector("form");

const room = document.querySelector("#room");
const h3 = room.querySelector("h3");
const h2 = room.querySelector("h2");
const ul = room.querySelector("ul");
const nickForm = room.querySelector("#nick");
const roomForm = room.querySelector("#message");

const button = document.querySelector("button[id=video]");
button.addEventListener("click", (e) => {
  history.pushState(null, "", `${location.origin}/video`);
  location.href = `${window.location.origin}/video`;
});

room.hidden = true;
let roomName;
let nick = "please set your ncik";

function backendDone(roomsize) {
  room.hidden = false;
  welcome.hidden = true;
  h3.textContent = `Room : ${roomName} (${roomsize})`;
  nickForm.addEventListener("submit", handleNickSubmit);
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
  const input = roomForm.querySelector("input");
  socket.emit(
    "newMessage",
    roomName,
    input.value,
    addMessage(`YOU : ${input.value}`)
  );
  input.value = "";
}

function handleNickSubmit(e) {
  e.preventDefault();
  const input = nickForm.querySelector("input");
  h2.textContent = `nick : ${input.value}`;
  socket.emit("set_nickname", input.value);
  input.value = "";
}

welcomForm.addEventListener("submit", handleWelcomeSubmit);
roomForm.addEventListener("submit", handleRoomSubmit);
//@ on event 확인///

socket.on("greeting", (id, roomSize) => {
  addMessage(`someone entered : ${id}`);
  h3.textContent = `Room : ${roomName} (${roomSize})`;
});

socket.on("bye", (id, roomName, roomSize) => {
  addMessage(`someone left : ${id}`);
  h3.textContent = `Room : ${roomName} (${roomSize - 1})`;
});

socket.on("chat", (msg, id) => {
  addMessage(`${id} : ${msg}`);
});

socket.on("room_change", (roomList) => {
  const welcomeUl = welcome.querySelector("ul");
  welcomeUl.textContent = "";

  if (roomList.length) {
    roomList.forEach((eachRoom) => {
      const li = document.createElement("li");
      li.textContent = eachRoom;
      welcomeUl.append(li);
    });
  }
});
