import * as THREE from "three";

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
    const projectiles = [];
    const numProjectiles = 15;
    const initialSpeed = 15;
    const gravity = -0.2;

    for (let i = 0; i < numProjectiles; i++) {
      const projectileGeometry = new THREE.SphereGeometry(5, 8, 8);
      const projectileMaterial = new THREE.MeshPhongMaterial({
        color: 0xffa500,
      });
      const projectile = new THREE.Mesh(projectileGeometry, projectileMaterial);

      projectile.position.copy(player.mesh.position);

      let angleOffset = ((Math.random() - 0.5) * Math.PI) / 8;
      let velocity = new THREE.Vector3(0, 0.5, -1)
        .applyAxisAngle(new THREE.Vector3(0, 1, 0), angleOffset)
        .normalize()
        .multiplyScalar(initialSpeed);

      projectile.userData = { velocity }; // Store velocity for updates
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
    if (player.isShrunk) return; 
    player.isShrunk = true;
    const targetScale = new THREE.Vector3(0.2, 0.2, 0.2);
    const normalScale = new THREE.Vector3(1, 1, 1); 
    const duration = 800;
    let startTime = performance.now();

    function lerpScale(currentTime) {
      let elapsedTime = currentTime - startTime;
      let t = Math.min(elapsedTime / duration, 1); 

      player.mesh.scale.lerpVectors(normalScale, targetScale, t);

      if (t < 1) {
        requestAnimationFrame(lerpScale);
      } else {
        setTimeout(() => {
          startTime = performance.now();

          function lerpBackScale(currentTime) {
            let elapsedTime = currentTime - startTime;
            let t = Math.min(elapsedTime / duration, 1);

            player.mesh.scale.lerpVectors(targetScale, normalScale, t);

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

    setTimeout(() => {
      player.isSlowed = false;
      player.obstacleSpeed = player.obstacleSpeed * 2;
    }, 8000); 
  },
};
