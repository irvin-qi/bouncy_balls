import * as THREE from "three";
import bottomTube from "/assets/bottomTube.jpeg";
import topTube from "/assets/topTube.jpeg";

export function createObstacle(width, height, depth, x, y, z) {
  const bottomRad = 12;
  const bottomHeight = height;
  const topRad = 15;
  const topHeight = 15;
  const segments = 100; // Higher segments for smoothness
  const upperPos = 100;

  const bottomGeom = new THREE.CylinderGeometry(
    bottomRad,
    bottomRad,
    bottomHeight,
    segments,
    1,
    false,
    0,
    Math.PI * 2
  );

  const topGeom = new THREE.CylinderGeometry(
    topRad,
    topRad,
    topHeight,
    segments,
    1,
    true,
    0,
    Math.PI * 2
  );

  const diskGeom = new THREE.CylinderGeometry(
    topRad,
    topRad,
    1,
    segments,
    false
  );

  const bottomTexture = new THREE.TextureLoader().load(bottomTube);
  const topTexture = new THREE.TextureLoader().load(topTube);

  const bottomMat = new THREE.MeshStandardMaterial({
    map: bottomTexture,
  });

  const topMat = new THREE.MeshStandardMaterial({
    map: topTexture,
    side: THREE.DoubleSide, // Ensure both sides of the cylinder are visible
    transparent: true,
  });

  const diskMat = new THREE.MeshBasicMaterial({ color: 0x000000 });

  const bottomObj = new THREE.Mesh(bottomGeom, bottomMat);
  const topObj = new THREE.Mesh(topGeom, topMat);
  const disk = new THREE.Mesh(diskGeom, diskMat);

  topObj.position.set(0, bottomHeight / 2, 0);
  disk.position.set(0, (bottomHeight + topHeight) / 2, 0);

  const obstacleGroup = new THREE.Group();
  obstacleGroup.add(bottomObj);
  obstacleGroup.add(topObj);
  obstacleGroup.add(disk);
  // Rotate the obstacle group based on the y position (for example, rotating by 90 degrees)
  obstacleGroup.rotation.z = y > upperPos ? Math.PI : 0;

  obstacleGroup.position.set(x, y, z);

  // Cast shadow for the combined obstacle
  obstacleGroup.castShadow = true;

  return obstacleGroup;
}

export function updateObstacles(obstacles, player, scene, endGame) {
  const obstacleSpeed = 0.8;
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
      obstacles.splice(i, 1); // Can't use delete since it leaves undefined
    }
  }
}
