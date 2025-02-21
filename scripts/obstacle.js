import * as THREE from 'three';

export function createObstacle(width, height, depth, x, y, z) {
    const obstacleGeometry = new THREE.BoxGeometry(width, height, depth);
    const obstacleMaterial = new THREE.MeshPhongMaterial({ color: 0x43B047 }); 
    const obstacle = new THREE.Mesh(obstacleGeometry, obstacleMaterial);
    obstacle.position.set(x, y, z);
    obstacle.castShadow = true;
    return obstacle;
}

export function updateObstacles(obstacles, player, scene){
    const obstacleSpeed = 0.8;

    for (let i = 0; i < obstacles.length; i++){
        let obstacle = obstacles[i];
        obstacle.position.z += obstacleSpeed;
        if (obstacle.position.z > player.mesh.position.z + 20){
            scene.remove(obstacle);
            obstacles.splice(i, 1); // cant use delete since leaves undefined
        }
    }
}