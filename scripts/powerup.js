    import * as THREE from "three";

    export function createPowerUp(x, y, z, effect) {
        const powerUpGeometry = new THREE.BoxGeometry(30, 30, 30);
        const powerUpMaterial = new THREE.MeshPhongMaterial({
            color: 0xffd700,
            emissive: 0xffd700,
            emissiveIntensity: 0.5  // Adjust the intensity for the desired glow
          });
        const powerUp = new THREE.Mesh(powerUpGeometry, powerUpMaterial);
        powerUp.position.set(x, y, z);
        return {"mesh": powerUp, effect};
    }

    export function updatePowerUps(powerUps, player, scene, speed) {
        const playerBox = new THREE.Box3().setFromObject(player.mesh);

        for (let i = 0; i < powerUps.length; i++) {
            const powerUp = powerUps[i];
            const powerUpBox = new THREE.Box3().setFromObject(powerUp.mesh);

            powerUp.mesh.position.z += speed;

            if (powerUp.mesh.position.z > player.mesh.position.z + 20) {
                scene.remove(powerUp.mesh);
                powerUps.splice(i, 1); // Can't use delete since it leaves undefined
            }

            if (playerBox.intersectsBox(powerUpBox)) {
                console.log("activate")
                powerUp.effect(player, scene);
                scene.remove(powerUp.mesh);
                powerUps.splice(i, 1); // Remove the power-up after collecting it
            }
        }
    }