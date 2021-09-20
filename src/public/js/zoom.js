const socket = io();

const myFace = document.querySelector("#myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const selectCamera = document.getElementById("whichCamera");

let myStream;
let muted = false;
let cameraOff = false;

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

getMedia();

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
  myStreame
    .getVideoTracks()
    .forEach((track) => (track.enabled = !track.enabled));
  if (cameraOff) {
    cameraBtn.textContent = "camera off";
  } else {
    cameraBtn.textContent = "camera on";
  }
}
async function handleCameraSelect() {
  //await getMedia(selectCamera.value);
}

muteBtn.addEventListener("click", handleMute);
cameraBtn.addEventListener("click", handleCamera);
selectCamera.addEventListener("input", handleCameraSelect);
console.log(selectCamera.value);
