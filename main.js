import * as THREE from "three";
import { initEnvironment } from "./scripts/environment.js";
import { createPlayer, updatePlayer } from "./scripts/player.js";
import { setupInput } from "./scripts/input.js";
import { createObstacle, updateObstacles } from "./scripts/obstacle.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const renderer = new THREE.WebGLRenderer({ antialias: true });
let gameState = { active: false }; // need object to pass by reference
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(
  35,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 75, 75); // Adjust this as needed
camera.lookAt(0, 0, 0);

const scene = new THREE.Scene();

const controls = new OrbitControls(camera, renderer.domElement);

initEnvironment(scene, renderer);
const player = createPlayer(scene);
const keysPressed = setupInput(player, gameState, () => {
  // gameStart function
  gameState.active = true;
  generateStarterObstacles();
  player.velocityY = 0.9;
  camera.position.set(
    player.mesh.position.x,
    player.mesh.position.y,
    player.mesh.position.z + 75
  );
  camera.lookAt(player.mesh.position);
  console.log("Game started!");
});

let obstacles = [];

function endGame() {
  gameState.active = false;
  player.mesh.position.set(0, 75, 0);
  obstacles.forEach((obstacle) => scene.remove(obstacle));
  obstacles = [];
  console.log("Game ended!");
}

function generateStarterObstacles() {
  for (let i = 0; i < 10; i++) {
    // number of starter obstacles
    let xPos = Math.floor(Math.random() * 200) - 100;
    let yPos = Math.random() < 0.5 ? 30 : 120;
    let zPos = player.mesh.position.z - (150 + i * 100); // spaced apart
    let obstacle = createObstacle(25, 60, 50, xPos, yPos, zPos);
    obstacles.push(obstacle);
    scene.add(obstacle);
  }
}

let lastObstacleTime = 0;

function render(time) {
  time *= 0.001;
  if (gameState.active) {
    if (time - lastObstacleTime >= 1.5) {
      lastObstacleTime = time;
      for (let i = 0; i < 4; i++) {
        let obstacle = createObstacle(
          25,
          60,
          50,
          Math.floor(Math.random() * 200) - 100,
          Math.random() < 0.5 ? 30 : 120,
          player.mesh.position.z - 950
        );
        obstacles.push(obstacle);
        scene.add(obstacle);
      }
    }
    updateObstacles(obstacles, player, scene, endGame);
    updatePlayer(player, keysPressed, endGame);
  }

  controls.target.set(
    player.mesh.position.x,
    player.mesh.position.y,
    player.mesh.position.z
  );
  controls.update();

  renderer.render(scene, camera);
  requestAnimationFrame(render);
}
requestAnimationFrame(render);

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
