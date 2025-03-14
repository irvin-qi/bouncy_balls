import * as THREE from "three";
import { initEnvironment } from "./scripts/environment.js";
import { createPlayer, updatePlayer } from "./scripts/player.js";
import { setupInput } from "./scripts/input.js";
import { createPowerUp, updatePowerUps } from "./scripts/powerup.js";
import { createObstacle, updateObstacles } from "./scripts/obstacle.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { displayText, removeText } from "./scripts/text.js";
import { powerUpEffects } from "./scripts/powerupEffects.js";
import { createCoin, updateCoins } from "./scripts/coin.js";

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
let coins = [];

const lanes = [-80, -40, 0, 40, 80];

let score = 0;
let coinScore = 0;
let lastScore = 0;
const scoreDiv = document.getElementById("score");

let highestScore = 0;

function updateScore(newScore) {
  score = newScore;
  scoreDiv.innerText = "Score: " + score;
}

let bounds = initEnvironment(scene, renderer);
const { ground, roof, sunLight } = bounds;
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
  score = 0;
  lastScore = 0;
  coinScore = 0;
  startTime = performance.now() * 0.001; // set start time (in seconds)
  removeText(scene);
});

function endGame() {
  gameState.active = false; // Stop game logic

  player.mesh.position.set(0, 75, 0);
  if (player.isShielded) {
    scene.remove(player.shieldMesh);
    player.isShielded = false;
  }
  if (player.isShrunk) {
    player.mesh.scale.set(1, 1, 1);
    player.isShrunk = false;
  }

  obstacles.forEach((obstacle) => scene.remove(obstacle));
  obstacles = [];
  powerUps.forEach((powerUp) => scene.remove(powerUp.mesh));
  powerUps = [];
  coins.forEach((coin) => scene.remove(coin));
  coins = [];
  console.log("Game ended!");
  cancelAnimationFrame(gameLoopId); // Stop rendering

  if (score > highestScore) highestScore = score;

  displayText(
    "GAME OVER",
    "Score: " + score + " | High Score: " + highestScore,
    scene
  );

  generateStarterObstacles();
  console.log("Resuming game...");
  requestAnimationFrame(render);
}

function generateStarterObstacles() {
  for (let i = 0; i < 10; i++) {
    const obstacleHeight = Math.floor(Math.random() * (60 - 30 + 1)) + 30;
    const laneIndex = Math.floor(Math.random() * lanes.length);
    const xPos = lanes[laneIndex];
    const yPos =
      Math.random() < 0.5
        ? lowerObstacleYPos + (obstacleHeight - 45) / 2
        : upperObstacleYPos - (obstacleHeight - 45) / 2;
    const zPos = -(150 + i * 100);
    let obstacle = createObstacle(25, obstacleHeight, 50, xPos, yPos, zPos);
    obstacles.push(obstacle);
    scene.add(obstacle);
  }
}

let lastObstacleTime = 0;
let lastPowerupTime = 0;
let lastCoinTime = 0;
let startTime = 0;
const smoothTarget = new THREE.Vector3().copy(player.mesh.position);

function updateCustomShaderUniforms() {
  scene.traverse(function (object) {
    if (object.material && object.material instanceof THREE.ShaderMaterial) {
      object.material.uniforms.uViewPosition.value.copy(camera.position);
      object.material.uniforms.uLightPosition.value.copy(sunLight.position);
      let lightMatrix = new THREE.Matrix4();
      lightMatrix.multiplyMatrices(
        sunLight.shadow.camera.projectionMatrix,
        sunLight.shadow.camera.matrixWorldInverse
      );
      object.material.uniforms.lightMatrix.value.copy(lightMatrix);
      if (sunLight.shadow.map && sunLight.shadow.map.texture) {
        object.material.uniforms.uShadowMap.value = sunLight.shadow.map.texture;
      }
    }
  });
}

function render(time) {
  gameLoopId = requestAnimationFrame(render);
  time *= 0.001;
  if (gameState.active) {
    const elapsed = time - startTime;
    let timeScore = Math.floor(elapsed * 10);
    let currentScore = timeScore + coinScore;
    if (currentScore !== lastScore) {
      lastScore = currentScore;
      updateScore(currentScore);
    }
    if (time - lastObstacleTime >= 1) {
      lastObstacleTime = time;
      const obstacleCount = Math.floor(Math.random() * 5) + 2;
      let availableLanes = lanes.slice();
      for (let i = 0; i < obstacleCount; i++) {
        const laneIndex = Math.floor(Math.random() * availableLanes.length);
        const laneX = availableLanes.splice(laneIndex, 1)[0];
        const obstacleHeight =
          Math.floor(Math.random() * (60 - 30 + 1)) + 30;
        let obstacleY;
        if (Math.random() < 0.5) {
          obstacleY = lowerObstacleYPos + (obstacleHeight - 45) / 2;
        } else {
          obstacleY = upperObstacleYPos - (obstacleHeight - 45) / 2;
        }
        const obstacleZ = player.mesh.position.z - 950;
        let obstacle = createObstacle(
          25,
          obstacleHeight,
          50,
          laneX,
          obstacleY,
          obstacleZ
        );
        obstacles.push(obstacle);
        scene.add(obstacle);
      }
    }
    if (time - lastPowerupTime >= 5) {
      lastPowerupTime = time;
      for (let i = 0; i < 4; i++) {
        let keys = Object.keys(powerUpEffects);
        let powerUpType = keys[Math.floor(Math.random() * keys.length)];
        console.log(powerUpType);
        const powerUp = createPowerUp(
          Math.floor(Math.random() * 200) - 100,
          Math.floor(Math.random() * 120) + 20,
          player.mesh.position.z - 950,
          () => powerUpEffects[powerUpType](player, scene, obstacles)
        );
        powerUps.push(powerUp);
        console.log("Powerup created!");
        scene.add(powerUp.mesh);
      }
    }
    if (time - lastCoinTime >= 1) {
      lastCoinTime = time;
      for (let i = 0; i < 2; i++) {
        const coin = createCoin(
          Math.floor(Math.random() * 200) - 100,
          Math.floor(Math.random() * 150) + 10,
          player.mesh.position.z - 950
        );
        coins.push(coin);
        console.log("coin created!");
        scene.add(coin);
      }
    }
    updateObstacles(obstacles, player, scene, endGame, player.obstacleSpeed);
    updatePowerUps(powerUps, player, scene, player.obstacleSpeed);
    updateCoins(
      coins,
      player,
      scene,
      () => {
        coinScore += 100;
        console.log("coin collected!");
      },
      player.obstacleSpeed
    );
    updatePlayer(player, keysPressed, endGame);
    ground.position.z = player.mesh.position.z;
    roof.position.z = player.mesh.position.z;

    if (keysPressed["1"]) {
      powerUpEffects.bomb(player, scene, obstacles)
    }
    if (keysPressed["2"]) {
      powerUpEffects.slow(player)
    }
    if (keysPressed["3"]) {
      powerUpEffects.shrink(player)
    }
    if (keysPressed["4"]) {
      powerUpEffects.shield(player, scene)
    }
    if (keysPressed["5"]) {
      powerUpEffects.projectile(player, scene, obstacles)
    }
  }
  smoothTarget.lerp(player.mesh.position, 0.02);
  smoothTarget.x = THREE.MathUtils.clamp(smoothTarget.x, -40, 40);
  smoothTarget.y = THREE.MathUtils.clamp(smoothTarget.y, -160, 160);
  controls.target.copy(smoothTarget);
  camera.lookAt(smoothTarget);
  controls.update();

  updateCustomShaderUniforms();

  renderer.render(scene, camera);
}
requestAnimationFrame(render);

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
