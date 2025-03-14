export function createPowerUp(x, y, z, effect) {
    const powerUpGeometry = new THREE.BoxGeometry(10, 10, 10);
    const powerUpMaterial = new THREE.MeshPhongMaterial({ color: 0xffd700 });
    const powerUp = new THREE.Mesh(powerUpGeometry, powerUpMaterial);
    powerUp.position.set(x, y, z);
    return {powerUp, effect};
}