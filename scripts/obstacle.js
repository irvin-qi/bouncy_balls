import * as THREE from 'three';

export function createObstacle(height, width, length) {
    const obstacleGeometry = new THREE.BoxGeometry(length, width, height);
    const obstacleMaterial = new THREE.MeshPhongMaterial({ color: 0x43B047 });
}