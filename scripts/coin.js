import * as THREE from "three";
import { createCustomPhongMaterial } from "../customShader.js";

export function createCoin(x, y, z) {
  // 1) Create a cylinder for the coin.
  const coinGeometry = new THREE.CylinderGeometry(9, 9, 2, 32, 1, false);

  // 2) Material for the coin’s rim (side).
  const sideMaterial = createCustomPhongMaterial({
    ambientColor: new THREE.Color(0x222222),
    diffuseColor: new THREE.Color(0xffd700), // Gold
    specularColor: new THREE.Color(0xffffff),
    shininess: 50.0,
  });

  // 3) Load the texture for the top/bottom faces.
  const coinFaceTexture = new THREE.TextureLoader().load("/assets/coin.png");
  
  //    (A) Ensure the texture can scale (repeat) and rotate around the center.
  coinFaceTexture.wrapS = THREE.ClampToEdgeWrapping;
  coinFaceTexture.wrapT = THREE.ClampToEdgeWrapping;
  coinFaceTexture.center.set(0.5, 0.5);

  //    (B) Rotate the texture by -90 degrees (flipping it in the correct direction).
  // coinFaceTexture.rotation = -Math.PI / 2;

  //    (C) Zoom in by increasing the repeat values.
  coinFaceTexture.repeat.set(1.5, 1.5);

  // 4) Create materials for the top and bottom faces.
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

  // 5) Pass the materials in this order: [side, top, bottom].
  const coin = new THREE.Mesh(coinGeometry, [sideMaterial, topMaterial, bottomMaterial]);

  // 6) Shadows
  coin.castShadow = true;

  // 7) Position & orient the coin
  coin.rotation.x = -Math.PI / 2;

  coin.position.set(x, y, z);
  return coin;
}

export function updateCoins(coins, player, scene, addPoints, speed) {
  const playerBox = new THREE.Box3().setFromObject(player.mesh);
  for (let i = coins.length - 1; i >= 0; i--) {
    const coin = coins[i];
    // Spin the coin so we can see the texture more clearly.
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
