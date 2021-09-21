const socket = io();

const myFace = document.querySelector("#myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const selectCamera = document.getElementById("whichCamera");

const roomTitle = document.querySelector(".roomname");
const main = document.querySelector("#myStream");
const enter = main.querySelector("#welcome");
const enterForm = enter.querySelector("form");

const calling = main.querySelector("#room");

let myStream;
let muted = false;
let cameraOff = false;
let roomName = "";
let myPeerConnection;

calling.hidden = true;
roomTitle.textContent = "";

async function getCameras() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((e) => e.kind === "videoinput");
    const currentCamera = myStream.getVideoTracks()[0];

    cameras.forEach((camera) => {
      const option = document.createElement("option");
      option.value = camera.deviceId;
      option.textContent = camera.label;

      if (camera.label === currentCamera.label) {
        option.selected = true;
      }
      selectCamera.append(option);
    });
  } catch (e) {
    console.log(e);
  }
}

async function getMedia(deviceId) {
  const init = {
    audio: false,
    video: {
      facingMode: "user",
    },
  };

  const cameraInit = {
    audio: false,
    video: {
      deviceId,
    },
  };

  try {
    myStream = await navigator.mediaDevices.getUserMedia(
      deviceId ? cameraInit : init
    );

    myFace.srcObject = myStream;
    if (!deviceId) {
      await getCameras();
    }
  } catch (e) {
    console.log(e);
  }
}

function handleMute() {
  muted = !muted;
  myStream
    .getAudioTracks()
    .forEach((track) => (track.enabled = !track.enabled));
  if (!muted) {
    muteBtn.textContent = "unmuted";
  } else {
    muteBtn.textContent = "muted";
  }
}
function handleCamera() {
  cameraOff = !cameraOff;
  myStream
    .getVideoTracks()
    .forEach((track) => (track.enabled = !track.enabled));
  if (cameraOff) {
    cameraBtn.textContent = "camera off";
  } else {
    cameraBtn.textContent = "camera on";
  }
}
async function handleCameraSelect() {
  await getMedia(selectCamera.value);

  //if we enterd the room, RTC instance is contructed.
  //it has our prev setting.
  //and when other peope come to my room, the will received that setting
  //but, when we change the camera, we should send this info to other local

  if (myPeerConnection) {
    const recentVideoTrack = myStream.getVideoTracks()[0];
    //sender is the track info that we send to the remote local
    const videoSender = myPeerConnection
      .getSenders()
      .find((sender) => sender.track.kind === "video");
    videoSender.replaceTrack(recentVideoTrack);
  }
}

async function initMedia() {
  calling.hidden = false;
  enter.hidden = true;
  await getMedia();
  makeConnection();
}

async function handleEnterSubmit(e) {
  e.preventDefault();
  const input = enterForm.querySelector("input");

  await initMedia(); // init should be run first before socket emit("join_room")
  //cause my socket need to have a time to make peer connection instance

  socket.emit("join_room", input.value);
  roomName = input.value;
  roomTitle.textContent = `room : ${roomName}`;

  input.value = "";
}

muteBtn.addEventListener("click", handleMute);
cameraBtn.addEventListener("click", handleCamera);
selectCamera.addEventListener("input", handleCameraSelect);
enterForm.addEventListener("submit", handleEnterSubmit);

//socket access
socket.on("welcome", async () => {
  //createOffer => like invitation which is sent to other socket;
  //of course, this invitation has an information for my stream
  const offer = await myPeerConnection.createOffer();
  myPeerConnection.setLocalDescription(offer); //set my local environment in offer

  //now, let's send this invitation to other socket;
  socket.emit("offer", offer, roomName);
});

socket.on("offer", async (offerFromOtherSocket) => {
  //we get local info from "remote" local
  // so set this in the myPeerConnection instance
  myPeerConnection.setRemoteDescription(offerFromOtherSocket);

  // then, we make answer to send
  const answer = await myPeerConnection.createAnswer(); // it is my local environment to send to other local
  myPeerConnection.setLocalDescription(answer); //attach this info to answer instance;

  socket.emit("answer", answer, roomName);
});

socket.on("answer", (answer) => {
  // the person who make the room or existing in the room before, will get the answer;
  myPeerConnection.setRemoteDescription(answer);
});

socket.on("ice", (ice) => {
  console.log("I received your candidate");
  myPeerConnection.addIceCandidate(ice);
});

// RTC
// this instance contains my tools' setting object(track) and control pannel object itself(myStream)
function makeConnection() {
  myPeerConnection = new RTCPeerConnection();

  //after remote info exchange with offer and answer,
  //we will do ice connection which is for real connection
  //after that, with addstream, we can exchange our data(data is from myPeerConnection)
  myPeerConnection.addEventListener("icecandidate", handleIce);
  myPeerConnection.addEventListener("addstream", handleAddStream);

  myStream
    .getTracks()
    .forEach((track) => myPeerConnection.addTrack(track, myStream));
}

function handleIce(data) {
  //I will give the result of ice event and I will receive the ice event from connected local
  socket.emit("ice", data.candidate, roomName);

  console.log("I send my candidate");
}

function handleAddStream(data) {
  console.log("got an event from peer");
  const peerStream = document.querySelector("#peerStream video");
  peerStream.srcObject = data.stream;
}
