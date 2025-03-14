import * as THREE from "three";

export function createObstacle(width, height, depth, x, y, z) {
  const obstacleGeometry = new THREE.CylinderGeometry(
    width / 2,
    width / 2,
    height,
    100
  );
  const obstacleMaterial = new THREE.MeshPhongMaterial({ color: 0x6dbf3e });
  const obstacle = new THREE.Mesh(obstacleGeometry, obstacleMaterial);
  obstacle.position.set(x, y, z);
  obstacle.castShadow = true;
  return obstacle;
}

export function updateObstacles(obstacles, player, scene, endGame) {
  const obstacleSpeed = 2;
  const playerBox = new THREE.Box3().setFromObject(player.mesh);

  for (let i = 0; i < obstacles.length; i++) {
    let obstacle = obstacles[i];
    obstacle.position.z += obstacleSpeed;
    const obstacleBox = new THREE.Box3().setFromObject(obstacle);
    if (playerBox.intersectsBox(obstacleBox)) {
      endGame();
      return;
    }
    if (obstacle.position.z > player.mesh.position.z + 20) {
      scene.remove(obstacle);
      obstacles.splice(i, 1); // cant use delete since leaves undefined
    }
  }
}
