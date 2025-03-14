// powerup.js
import * as THREE from "three";
import { createCustomPhongMaterial } from "../customShader.js";

export function createPowerUp(x, y, z, effect) {
  const powerUpGeometry = new THREE.BoxGeometry(15, 15, 15);
  
  // Load the power-up texture.
  const powerUpTexture = new THREE.TextureLoader().load('/assets/powerupTexture.png');
  powerUpTexture.minFilter = THREE.LinearMipmapLinearFilter;
  powerUpTexture.generateMipmaps = true;
  
  const powerUpMaterial = createCustomPhongMaterial({
    texture: powerUpTexture,
    ambientColor: new THREE.Color(0x222222),
    diffuseColor: new THREE.Color(0xffffff),
    specularColor: new THREE.Color(0xffd700),
    shininess: 50.0,
  });

  const powerUpMesh = new THREE.Mesh(powerUpGeometry, powerUpMaterial);
  powerUpMesh.position.set(x, y, z);
  powerUpMesh.castShadow = true; // Enable shadow casting for the power-up.
  return { "mesh": powerUpMesh, effect };
}

export function updatePowerUps(powerUps, player, scene, speed) {
  const playerBox = new THREE.Box3().setFromObject(player.mesh);
  for (let i = 0; i < powerUps.length; i++) {
    const powerUp = powerUps[i];
    const powerUpBox = new THREE.Box3().setFromObject(powerUp.mesh);
    powerUp.mesh.position.z += speed;
    if (powerUp.mesh.position.z > player.mesh.position.z + 20) {
      scene.remove(powerUp.mesh);
      powerUps.splice(i, 1);
    }
    if (playerBox.intersectsBox(powerUpBox)) {
      console.log("activate");
      powerUp.effect(player, scene);
      scene.remove(powerUp.mesh);
      powerUps.splice(i, 1);
    }
  }
}
