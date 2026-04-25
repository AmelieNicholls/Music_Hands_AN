//global variables
let video;
let handPose;
let hands = [];
let drums;
let bass;
let chords;
let melody;
let fx;

//run preload before program starts. Prepares everything before sketch begins
function preload() {
  handPose = ml5.handPose({ flipped: true });

  soundFormats('wav');
  drums = loadSound('audio/Drums_Layer.wav');
  bass = loadSound('audio/Bass_Layer.wav');
  chords = loadSound('audio/Chords_Layer.wav');
  melody = loadSound('audio/Melody_Layer.wav');
  fx = loadSound('audio/Fx_Layer.wav');
}

//recieve hand data from ml5 library and store
function gotHands(results) {
  hands = results;
}

//use for audio playback so that the browser does not block
function mousePressed() {
  userStartAudio();
  console.log(hands);
}

//to check if a finger is raised by the vertical position, true if finger is upwards
function isFingerUp(tip, base) {
  return tip.y < base.y;
}

//start webcam, activate hand tracking and prepare audio
function setup() {
 createCanvas(1900, 900); //create drawing canvas
 video = createCapture(VIDEO, { flipped: true }); //start webcam video and flip image
 video.size(1120, 840);
 video.hide();

 handPose.detectStart(video, gotHands); //detect hands from video and sent results to gotHands()

 userStartAudio();

 //loop all audio continuously
 drums.loop();
  bass.loop();
  chords.loop();
  melody.loop();
  fx.loop();

  drums.setVolume(0);
  bass.setVolume(0);
  chords.setVolume(0);
  melody.setVolume(0);
  fx.setVolume(0);
}

function draw() {
  background(0);

  let x = width / 2 - video.width / 2;
  let y = height / 2 - video.height / 2;

if (hands.length > 0) { //check if a hand is detected, if yes then run
  let hand = hands[0];
  let landmarks = hand.keypoints;

  //this determines which finger is rasied by placement on camera
  let thumbUp = isFingerUp(landmarks[4], landmarks[3]);
  let indexUp = isFingerUp(landmarks[8], landmarks[6]);
  let middleUp = isFingerUp(landmarks[12], landmarks[10]);
  let ringUp = isFingerUp(landmarks[16], landmarks[14]);
  let pinkyUp = isFingerUp(landmarks[20], landmarks[18]);
  
  //adjust volume based on finger position so that it is either mute or playing and not on/off
  drums.setVolume(thumbUp ? 1 : 0, 0.2);// 0.2 to create smooth fade in/out time
  bass.setVolume(indexUp ? 1 : 0, 0.2);
  chords.setVolume(middleUp ? 1 : 0, 0.2);
  melody.setVolume(ringUp ? 1 : 0, 0.2);
  fx.setVolume(pinkyUp ? 1 : 0, 0.2);

  let fingerCount =
  thumbUp +
  indexUp +
  middleUp +
  ringUp +
  pinkyUp;

let numScreens = Math.pow(2, fingerCount);//to calculate number of screens to use. each finger doubles number

numScreens = Math.min(numScreens, 16); //limit number of videos to fit screen size

let cols = ceil(sqrt(numScreens)); //calculating grid layout so its balanced using rows and columns
let rows = ceil(numScreens / cols);

let cellWidth = width / cols;
let cellHeight = height / rows;

let colors = [ //create bright colour filters per screen to separate them
  [255, 0, 0],
  [0, 255, 0],
  [0, 0, 255],
  [255, 255, 0],
  [255, 0, 255],
  [0, 255, 255]
];

for (let i = 0; i < numScreens; i++) { // draw multiple video sections bsed off screen number

  let col = i % cols;
  let row = floor(i / cols);

  let x = col * cellWidth;
  let y = row * cellHeight;

  let c = colors[i % colors.length];

  if (pinkyUp) { //to create effect when finger is raised, colours become random and flash.

  tint(
   random(colors)
  );

}
else {

  tint(c[0], c[1], c[2]);

}

  image(
    video,
    x,
    y,
    cellWidth,
    cellHeight
  );

}

noTint();
  }

  else { //this is for idle state when no hand is detected, no audio is played
    drums.setVolume(0, 0.2);
    bass.setVolume(0, 0.2);
    chords.setVolume(0, 0.2);
    melody.setVolume(0, 0.2);
    fx.setVolume(0, 0.2);

    background(0);
    fill (255);
    textSize(32);
    textAlign(CENTER, CENTER); //instruct user to show hand to start experience.
    text('Show your hand to start creating music', width / 2, height / 2);
    text('Use fingers to control layers', width / 2, height / 2 + 60);
    text('Thumb = Drums, Index = Bass, Middle = Chords, Ring = Melody, Pinky = FX', width / 2, height / 2 + 120);
  }
}

