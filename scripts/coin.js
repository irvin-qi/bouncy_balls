import * as THREE from "three";

export function createCoin(x, y, z) {
  const coinGeometry = new THREE.CylinderGeometry(9, 9, 2, 16);
  const coinMaterial = new THREE.MeshPhongMaterial({ color: 0xffff00 });
  const coin = new THREE.Mesh(coinGeometry, coinMaterial);
  coin.rotation.x = Math.PI / 2;
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
