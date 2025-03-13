import * as THREE from "three";
import { initEnvironment } from "./scripts/environment.js";
import { createPlayer, updatePlayer } from "./scripts/player.js";
import { setupInput } from "./scripts/input.js";
import { createObstacle, updateObstacles } from "./scripts/obstacle.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { displayText, removeText } from "./scripts/text.js";
import { remove } from "three/examples/jsm/libs/tween.module.js";

const renderer = new THREE.WebGLRenderer({ antialias: true });
let gameState = { active: false };
let gameLoopId; // Store the animation frame ID

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(
  35,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 75, 75);
camera.lookAt(0, 0, 0);

const scene = new THREE.Scene();
const controls = new OrbitControls(camera, renderer.domElement);

initEnvironment(scene, renderer);
const player = createPlayer(scene);
const keysPressed = setupInput(player, gameState, () => {
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
  removeText(scene);
});

let obstacles = [];

function endGame() {
  gameState.active = false; // Stop game logic

  player.mesh.position.set(0, 75, 0);
  obstacles.forEach((obstacle) => scene.remove(obstacle));
  obstacles = [];
  console.log("Game ended!");
  cancelAnimationFrame(gameLoopId); // Stop rendering

  // Display "GAME OVER" and pause for 5 seconds
  displayText("GAME OVER - press space to play again", scene);

  console.log("Resuming game...");
  requestAnimationFrame(render);
}

function generateStarterObstacles() {
  for (let i = 0; i < 10; i++) {
    let xPos = Math.floor(Math.random() * 200) - 100;
    let yPos = Math.random() < 0.5 ? 30 : 120;
    let zPos = player.mesh.position.z - (150 + i * 100);
    let obstacle = createObstacle(25, 60, 50, xPos, yPos, zPos);
    obstacles.push(obstacle);
    scene.add(obstacle);
  }
}

let lastObstacleTime = 0;

function render(time) {
  gameLoopId = requestAnimationFrame(render); // Store loop ID
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
}
requestAnimationFrame(render);

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
