// powerupEffects.js
import * as THREE from "three";
import { createCustomPhongMaterial } from "../customShader.js";

export const powerUpEffects = {
  shield: (player, scene) => {
    if (player.isShielded) return;
    player.isShielded = true;
    const shieldGeometry = new THREE.SphereGeometry(12, 12, 12);
    const shieldMaterial = new THREE.MeshBasicMaterial({
      color: 0x00aaff,
      transparent: true,
      opacity: 0.5,
    });
    const shield = new THREE.Mesh(shieldGeometry, shieldMaterial);
    shield.position.copy(player.mesh.position);
    scene.add(shield);
    player.shieldMesh = shield;
    const shieldFollow = () => {
      if (player.isShielded && player.shieldMesh) {
        player.shieldMesh.position.copy(player.mesh.position);
        requestAnimationFrame(shieldFollow);
      }
    };
    shieldFollow();
  },
  projectile: (player, scene, obstacles) => {
    console.log("projectile effect activated");
    const projectiles = [];
    const numProjectiles = 20;
    const initialSpeed = 9;
    const gravity = -0.05;
    for (let i = 0; i < numProjectiles; i++) {
      const projectileGeometry = new THREE.SphereGeometry(5, 8, 8);
      const projectileMaterial = createCustomPhongMaterial({
        ambientColor: new THREE.Color(0x222222),
        diffuseColor: new THREE.Color(0xffa500), // Orange color.
        specularColor: new THREE.Color(0xffffff),
        shininess: 30.0,
      });
      const projectile = new THREE.Mesh(projectileGeometry, projectileMaterial);
      projectile.position.copy(player.mesh.position);
      const horizontalOffset = ((Math.random() - 0.5) * Math.PI) / 8;
      const verticalOffset = ((Math.random() - 0.5) * Math.PI) / 8;
      let baseVelocity = new THREE.Vector3(0, 0, -1);
      baseVelocity.applyAxisAngle(new THREE.Vector3(1, 0, 0), verticalOffset);
      baseVelocity.applyAxisAngle(new THREE.Vector3(0, 1, 0), horizontalOffset);
      const velocity = baseVelocity.normalize().multiplyScalar(initialSpeed);
      projectile.userData = { velocity };
      scene.add(projectile);
      projectiles.push(projectile);
    }
    function updateProjectiles() {
      for (let i = projectiles.length - 1; i >= 0; i--) {
        const projectile = projectiles[i];
        projectile.userData.velocity.y += gravity;
        projectile.position.add(projectile.userData.velocity);
        for (let j = obstacles.length - 1; j >= 0; j--) {
          const obstacle = obstacles[j];
          const projectileBox = new THREE.Box3().setFromObject(projectile);
          const obstacleBox = new THREE.Box3().setFromObject(obstacle);
          if (projectileBox.intersectsBox(obstacleBox)) {
            scene.remove(obstacle);
            scene.remove(projectile);
            obstacles.splice(j, 1);
            projectiles.splice(i, 1);
            break;
          }
        }
        if (projectile.position.y < 0) {
          scene.remove(projectile);
          projectiles.splice(i, 1);
        }
      }
      if (projectiles.length > 0) {
        requestAnimationFrame(updateProjectiles);
      }
    }
    updateProjectiles();
  },
  shrink: (player) => {
    // Don’t apply if already shrunk
    if (player.isShrunk) return;
    player.isShrunk = true;
  
    // Target scale for “small”
    const targetScale = new THREE.Vector3(0.2, 0.2, 0.2);
    // Normal (original) scale
    const normalScale = new THREE.Vector3(1, 1, 1);
  
    // How long the shrink/grow animation takes (in ms)
    const duration = 800;
    let startTime = performance.now();
  
    function lerpScale(currentTime) {
      let elapsedTime = currentTime - startTime;
      let t = Math.min(elapsedTime / duration, 1);
  
      // Shrink the player's mesh
      player.mesh.scale.lerpVectors(normalScale, targetScale, t);
  
      // If shield is active, shrink the shield mesh, too
      if (player.shieldMesh) {
        player.shieldMesh.scale.lerpVectors(normalScale, targetScale, t);
      }
  
      // Continue animating until fully shrunk
      if (t < 1) {
        requestAnimationFrame(lerpScale);
      } else {
        // Remain shrunk for 8 seconds, then grow back
        setTimeout(() => {
          startTime = performance.now();
  
          function lerpBackScale(currentTime) {
            let elapsedTime = currentTime - startTime;
            let t = Math.min(elapsedTime / duration, 1);
  
            // Grow the player's mesh back
            player.mesh.scale.lerpVectors(targetScale, normalScale, t);
  
            // If shield is active, grow the shield mesh back
            if (player.shieldMesh) {
              player.shieldMesh.scale.lerpVectors(targetScale, normalScale, t);
            }
  
            if (t < 1) {
              requestAnimationFrame(lerpBackScale);
            } else {
              player.isShrunk = false;
            }
          }
          requestAnimationFrame(lerpBackScale);
        }, 8000);
      }
    }
    requestAnimationFrame(lerpScale);
  },  
  slow: (player) => {
    if (player.isSlowed) return;
    player.isSlowed = true;
    player.obstacleSpeed = player.obstacleSpeed / 2;
    player.gravity = player.gravity / 2;
    setTimeout(() => {
      player.isSlowed = false;
      player.obstacleSpeed = player.obstacleSpeed * 2;
      player.gravity = player.gravity * 2;
    }, 5000);
  },
  bomb: (player, scene, obstacles) => {
    console.log("bomb effect activated");
    for (let i = 0; i < obstacles.length; i++) {
      let obstacle = obstacles[i];
      scene.remove(obstacle);
    }
    obstacles.length = 0;
  },
};
