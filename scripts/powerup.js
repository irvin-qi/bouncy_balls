// powerup.js
import * as THREE from "three";
import { createCustomPhongMaterial } from "../customShader.js";

export function createPowerUp(x, y, z, effect) {
  // 1) Create a cube geometry for the power-up.
  const powerUpGeometry = new THREE.BoxGeometry(15, 15, 15);

  // 2) Load the power-up texture. This same texture will be used on all sides.
  const powerUpTexture = new THREE.TextureLoader().load("/assets/powerup.png");
  powerUpTexture.minFilter = THREE.LinearMipmapLinearFilter;
  powerUpTexture.generateMipmaps = true;

  // 3) Create a single material using your custom shader, passing in the texture.
  const powerUpMaterial = createCustomPhongMaterial({
    texture: powerUpTexture,
    ambientColor: new THREE.Color(0x222222),
    diffuseColor: new THREE.Color(0xffffff),
    specularColor: new THREE.Color(0xffd700),
    shininess: 50.0,
  });

  // 4) Build the mesh with this one material. 
  //    Three.js automatically uses it for all faces of the box.
  const powerUpMesh = new THREE.Mesh(powerUpGeometry, powerUpMaterial);
  powerUpMesh.position.set(x, y, z);
  powerUpMesh.castShadow = true; // so it can cast shadows

  // 5) Return the mesh along with its effect callback.
  return { mesh: powerUpMesh, effect };
}

export function updatePowerUps(powerUps, player, scene, speed) {
  const playerBox = new THREE.Box3().setFromObject(player.mesh);

  for (let i = 0; i < powerUps.length; i++) {
    const powerUp = powerUps[i];
    const powerUpBox = new THREE.Box3().setFromObject(powerUp.mesh);

    // Move the power-up closer to the player each frame.
    powerUp.mesh.position.z += speed;

    // Remove power-up if it goes past the player.
    if (powerUp.mesh.position.z > player.mesh.position.z + 20) {
      scene.remove(powerUp.mesh);
      powerUps.splice(i, 1);
    }

    // Check collision with player.
    if (playerBox.intersectsBox(powerUpBox)) {
      console.log("Power-up collected!");
      // Activate the power-up's effect.
      powerUp.effect(player, scene);
      scene.remove(powerUp.mesh);
      powerUps.splice(i, 1);
    }
  }
}
