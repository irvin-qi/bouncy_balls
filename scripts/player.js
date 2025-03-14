import * as THREE from "three";
import { createCustomPhongMaterial } from "../customShader.js";

export function createPlayer(scene) {
  const geometry = new THREE.SphereGeometry(3, 32, 16);
  
  const playerMaterial = createCustomPhongMaterial({
    ambientColor: new THREE.Color(0x222222),
    diffuseColor: new THREE.Color(0xff0000), // Red color.
    specularColor: new THREE.Color(0xffffff),
    shininess: 30.0,
  });

  const mesh = new THREE.Mesh(geometry, playerMaterial);
  mesh.position.set(0, 75, 0);
  mesh.castShadow = true;
  scene.add(mesh);

  return {
    mesh,
    velocityY: 0,
    canJump: true,
    jumpCooldown: 80,
    moveSpeed: 0.3,
    gravity: -0.8,
    obstacleSpeed: 2,
  };
}

export function updatePlayer(player, keysPressed, endGame) {
  if (keysPressed["a"] && player.mesh.position.x > -100) {
    player.mesh.position.x -= player.moveSpeed;
  }
  if (keysPressed["d"] && player.mesh.position.x < 100) {
    player.mesh.position.x += player.moveSpeed;
  }
  player.velocityY += player.gravity * 0.02;
  player.mesh.position.y += player.velocityY;
  if (player.mesh.position.y - 3 <= 0) {
    player.mesh.position.y = 3;
    player.velocityY = 0;
    endGame();
  }
  if (player.mesh.position.y + 3 >= 150) {
    player.mesh.position.y = 147;
    player.velocityY = 0;
  }
  player.mesh.rotation.x += 0.01;
  player.mesh.rotation.y += 0.01;
}
