import * as THREE from "three";
import { createCustomPhongMaterial } from "../customShader.js";

export function createCoin(x, y, z) {
  const coinGeometry = new THREE.CylinderGeometry(9, 9, 2, 32, 1, false);

  const sideMaterial = createCustomPhongMaterial({
    ambientColor: new THREE.Color(0x222222),
    diffuseColor: new THREE.Color(0xffd700), // Gold
    specularColor: new THREE.Color(0xffffff),
    shininess: 50.0,
  });

  const coinFaceTexture = new THREE.TextureLoader().load("/assets/coin.png");
  
  coinFaceTexture.wrapS = THREE.ClampToEdgeWrapping;
  coinFaceTexture.wrapT = THREE.ClampToEdgeWrapping;
  coinFaceTexture.center.set(0.5, 0.5);

  coinFaceTexture.repeat.set(1.5, 1.5);

  const topMaterial = createCustomPhongMaterial({
    texture: coinFaceTexture,
    ambientColor: new THREE.Color(0x222222),
    diffuseColor: new THREE.Color(0xffffff),
    specularColor: new THREE.Color(0xffffff),
    shininess: 50.0,
  });

  const bottomMaterial = createCustomPhongMaterial({
    texture: coinFaceTexture,
    ambientColor: new THREE.Color(0x222222),
    diffuseColor: new THREE.Color(0xffffff),
    specularColor: new THREE.Color(0xffffff),
    shininess: 50.0,
  });

  const coin = new THREE.Mesh(coinGeometry, [sideMaterial, topMaterial, bottomMaterial]);

  coin.castShadow = true;

  coin.rotation.x = -Math.PI / 2;

  coin.position.set(x, y, z);
  return coin;
}

export function updateCoins(coins, player, scene, addPoints, speed) {
  const playerBox = new THREE.Box3().setFromObject(player.mesh);
  for (let i = coins.length - 1; i >= 0; i--) {
    const coin = coins[i];
    coin.rotation.z += 0.05;
    coin.position.z += speed;

    const coinBox = new THREE.Box3().setFromObject(coin);
    if (playerBox.intersectsBox(coinBox)) {
      addPoints();
      scene.remove(coin);
      coins.splice(i, 1);
    }
  }
}
