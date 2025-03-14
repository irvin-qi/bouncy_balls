import * as THREE from "three";
import bottomTube from "/assets/bottomTube.jpeg";
import topTube from "/assets/topTube.jpeg";
import { createCustomPhongMaterial } from "../customShader.js";

export function createObstacle(width, height, depth, x, y, z) {
  const segments = 100; // Higher segments for smoothness
  const upperPos = 100;

  const bottomRad = 12;
  const bottomHeight = height;

  // A closed cylinder for the bottom part (as in the original).
  // 'false' for openEnded means it has a cap on top/bottom.
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

  // Load the bottom texture (as before).
  const bottomTexture = new THREE.TextureLoader().load(bottomTube);
  bottomTexture.minFilter = THREE.LinearMipmapLinearFilter;
  bottomTexture.generateMipmaps = true;

  const bottomMat = createCustomPhongMaterial({
    texture: bottomTexture,
    ambientColor: new THREE.Color(0x222222),
    diffuseColor: new THREE.Color(0xffffff),
    specularColor: new THREE.Color(0xffffff),
    shininess: 30.0,
  });

  const bottomObj = new THREE.Mesh(bottomGeom, bottomMat);
  bottomObj.castShadow = true;

  const topRad = 15;      // Outer radius (slightly bigger than bottom)
  const topHeight = 15;   // Height of the top lip

  // Outer geometry: openEnded = true so you can see inside.
  const topOuterGeom = new THREE.CylinderGeometry(
    topRad,
    topRad,
    topHeight,
    segments,
    1,
    true, // openEnded
    0,
    Math.PI * 2
  );

  const innerTopRad = 14; 
  const topInnerGeom = new THREE.CylinderGeometry(
    innerTopRad,
    innerTopRad,
    topHeight,
    segments,
    1,
    true, // openEnded
    0,
    Math.PI * 2
  );

  // Load the top texture
  const topTexture = new THREE.TextureLoader().load(topTube);
  topTexture.minFilter = THREE.LinearMipmapLinearFilter;
  topTexture.generateMipmaps = true;

  // Outer material for the top tube
  const topMat = createCustomPhongMaterial({
    texture: topTexture,
    ambientColor: new THREE.Color(0x222222),
    diffuseColor: new THREE.Color(0xffffff),
    specularColor: new THREE.Color(0xffffff),
    shininess: 30.0,
  });

  topMat.side = THREE.DoubleSide;

  const topInnerMat = createCustomPhongMaterial({
    texture: topTexture,
    ambientColor: new THREE.Color(0x222222),
    diffuseColor: new THREE.Color(0xffffff),
    specularColor: new THREE.Color(0xffffff),
    shininess: 30.0,
  });
  topInnerMat.side = THREE.DoubleSide;

  const topOuterMesh = new THREE.Mesh(topOuterGeom, topMat);
  const topInnerMesh = new THREE.Mesh(topInnerGeom, topInnerMat);

  topOuterMesh.castShadow = true;
  topInnerMesh.castShadow = true;

  topOuterMesh.position.set(0, bottomHeight / 2, 0);
  topInnerMesh.position.set(0, bottomHeight / 2, 0);

  const obstacleGroup = new THREE.Group();
  obstacleGroup.add(bottomObj);
  obstacleGroup.add(topOuterMesh);
  obstacleGroup.add(topInnerMesh);

  obstacleGroup.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
    }
  });

  obstacleGroup.rotation.z = y > upperPos ? Math.PI : 0;

  obstacleGroup.position.set(x, y, z);
  obstacleGroup.castShadow = true;

  return obstacleGroup;
}


export function updateObstacles(obstacles, player, scene, endGame, speed) {
  const playerBox = new THREE.Box3().setFromObject(player.mesh);
  for (let i = 0; i < obstacles.length; i++) {
    let obstacle = obstacles[i];
    obstacle.position.z += speed;
    const obstacleBox = new THREE.Box3().setFromObject(obstacle);
    if (playerBox.intersectsBox(obstacleBox)) {
      if (player.isShielded) {
        scene.remove(player.shieldMesh);
        player.isShielded = false;
        scene.remove(obstacle);
        obstacles.splice(i, 1);
      } else {
        endGame();
        return;
      }
    }
    if (obstacle.position.z > player.mesh.position.z + 20) {
      scene.remove(obstacle);
      obstacles.splice(i, 1);
    }
  }
}
