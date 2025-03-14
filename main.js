import * as THREE from "three";
import { initEnvironment } from "./scripts/environment.js";
import { createPlayer, updatePlayer } from "./scripts/player.js";
import { setupInput } from "./scripts/input.js";
import { createPowerUp, updatePowerUps } from "./scripts/powerup.js";
import { createObstacle, updateObstacles } from "./scripts/obstacle.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { displayText, removeText } from "./scripts/text.js";
import { powerUpEffects } from "./scripts/powerupEffects.js";

const renderer = new THREE.WebGLRenderer({ antialias: true });
let gameState = { active: false };
let gameLoopId; // Store the animation frame ID
const lowerObstacleYPos = 20;
const upperObstacleYPos = 130;

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(
  35,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 75, 100);
camera.lookAt(0, 0, 0);

const scene = new THREE.Scene();
const controls = new OrbitControls(camera, renderer.domElement);
controls.minDistance = 50; 
controls.maxDistance = 150; 

let obstacles = [];
let powerUps = [];

initEnvironment(scene, renderer);
const player = createPlayer(scene);
generateStarterObstacles();
const keysPressed = setupInput(player, gameState, () => {
  gameState.active = true;
  player.velocityY = 0.9;
  camera.position.set(
    player.mesh.position.x,
    player.mesh.position.y,
    player.mesh.position.z + 100
  );
  camera.lookAt(player.mesh.position);
  console.log("Game started!");
  removeText(scene);
});

function endGame() {
  gameState.active = false; // Stop game logic

  player.mesh.position.set(0, 75, 0);
  if (player.isShielded) {
    scene.remove(player.shieldMesh);
    player.isShielded = false;
  }
  console.log(player.isShrunk);
  if (player.isShrunk){
    player.mesh.scale.set(1,1,1);
    player.isShrunk = false;
  }
  obstacles.forEach((obstacle) => scene.remove(obstacle));
  obstacles = [];
  console.log("Game ended!");
  cancelAnimationFrame(gameLoopId); // Stop rendering

  // Display "GAME OVER" and pause for 5 seconds
  displayText("GAME OVER", "PRESS SPACE TO RESTART", scene);
  generateStarterObstacles();

  console.log("Resuming game...");
  requestAnimationFrame(render);
}

function generateStarterObstacles() {
  for (let i = 0; i < 10; i++) {
    const obstacleHeight = Math.floor(Math.random() * (60 - 30 + 1)) + 30;

    let xPos = Math.floor(Math.random() * 200) - 100;
    let yPos =
      Math.random() < 0.5
        ? lowerObstacleYPos + (obstacleHeight - 45) / 2
        : upperObstacleYPos - (obstacleHeight - 45) / 2;
    let zPos = -(150 + i * 100);
    let obstacle = createObstacle(25, obstacleHeight, 50, xPos, yPos, zPos);
    obstacles.push(obstacle);
    scene.add(obstacle);
  }
}

let lastObstacleTime = 0;
let lastPowerupTime = 0;
const smoothTarget = new THREE.Vector3().copy(player.mesh.position);
function render(time) {
  gameLoopId = requestAnimationFrame(render); // Store loop ID
  time *= 0.001;

  if (gameState.active) {
    if (time - lastObstacleTime >= 1.5) {
      lastObstacleTime = time;

      for (let i = 0; i < 4; i++) {
        const obstacleHeight = Math.floor(Math.random() * (60 - 30 + 1)) + 30;

        let obstacle = createObstacle(
          25,
          obstacleHeight,
          50,
          Math.floor(Math.random() * 200) - 100,
          Math.random() < 0.5
            ? lowerObstacleYPos + (obstacleHeight - 45) / 2
            : upperObstacleYPos - (obstacleHeight - 45) / 2,
          player.mesh.position.z - 950
        );
        obstacles.push(obstacle);
        scene.add(obstacle);
      }
    }

    if (time - lastPowerupTime >= 5) {
      lastPowerupTime = time;
      let keys = Object.keys(powerUpEffects);
      let powerUpType = keys[Math.floor(Math.random() * keys.length)];
      console.log(powerUpType);
      const powerUp = createPowerUp(
        Math.floor(Math.random() * 200) - 100,
        Math.random() < 0.5 ? lowerObstacleYPos + 10 : upperObstacleYPos - 10,
        player.mesh.position.z - 950,
        ()=>powerUpEffects[powerUpType](player, scene, obstacles)
      );
      powerUps.push(powerUp);
      console.log("Powerup created!");
      scene.add(powerUp.mesh);
    }
    updateObstacles(obstacles, player, scene, endGame, player.obstacleSpeed);
    updatePowerUps(powerUps, player, scene, player.obstacleSpeed);
    updatePlayer(player, keysPressed, endGame);
  }
  smoothTarget.lerp(player.mesh.position, 0.02);
  smoothTarget.x = THREE.MathUtils.clamp(smoothTarget.x, -40, 40);
  smoothTarget.y = THREE.MathUtils.clamp(smoothTarget.y, -160, 160);
  controls.target.copy(smoothTarget)
  controls.update();

  renderer.render(scene, camera);
}
requestAnimationFrame(render);

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
