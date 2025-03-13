import * as THREE from "three";
import bottomTube from "/assets/bottomTube.jpeg";
import topTube from "/assets/topTube.jpeg";

export function createObstacle(width, height, depth, x, y, z) {
  const outerRadius = width / 2;
  const segments = 100; // Higher segments for smoothness

  // Create the main hollow cylinder geometry (the obstacle itself)
  const obstacleGeometry = new THREE.CylinderGeometry(
    outerRadius,
    outerRadius,
    height - height / 4,
    segments,
    1,
    true,
    0,
    Math.PI * 2
  );

  // Create the top smaller cylinder with a wider radius
  const topObsGeometry = new THREE.CylinderGeometry(
    outerRadius + 3, // Wider radius for the top cylinder
    outerRadius + 3, // Same base radius as the main obstacle
    height / 4, // Shorter height for the top cylinder
    segments,
    1,
    true,
    0,
    Math.PI * 2
  );

  // Load the textures for the tube
  const bottomTubeTexture = new THREE.TextureLoader().load(bottomTube);
  const topTubeTexture = new THREE.TextureLoader().load(topTube);

  // Define the material for the obstacle
  const obstacleMaterial = new THREE.MeshStandardMaterial({
    map: bottomTubeTexture,
    opacity: 1, // Fully opaque
    wireframe: false, // Set to true for a wireframe effect if you prefer
  });

  const topObsMaterial = new THREE.MeshStandardMaterial({
    map: topTubeTexture,
    side: THREE.DoubleSide, // Ensure both sides of the cylinder are visible
    transparent: true, // Make it partially transparent
    opacity: 1, // Fully opaque
    wireframe: false, // Set to true for a wireframe effect if you prefer
  });

  // Create meshes for the obstacle and top cylinder
  const obstacle = new THREE.Mesh(obstacleGeometry, obstacleMaterial);
  const topObs = new THREE.Mesh(topObsGeometry, topObsMaterial);

  // Position the topObs based on y
  if (y === 120) {
    // Place topObs below the main obstacle when y == 120
    topObs.position.set(0, -(height - height / 4) / 2, 0); // Position beneath
  } else {
    // Place topObs above the main obstacle in other cases
    topObs.position.set(0, (height - height / 4) / 2, 0); // Position on top
  }

  // Create a group to combine both meshes (obstacle and topObs)
  const obstacleGroup = new THREE.Group();
  obstacleGroup.add(obstacle);
  obstacleGroup.add(topObs);

  // Position the entire obstacle group
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
