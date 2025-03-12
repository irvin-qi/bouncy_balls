import * as THREE from "three";
import skyTexture from "/assets/sky.png";

export function initEnvironment(scene, renderer) {
  const geometry = new THREE.PlaneGeometry(200, 5000);
  const texture = new THREE.TextureLoader().load(skyTexture);
  const material = new THREE.MeshPhongMaterial({ color: 0x808080 });
  const ground = new THREE.Mesh(geometry, material);
  const roof = new THREE.Mesh(geometry, material);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;

  roof.rotation.x = Math.PI / 2;
  roof.position.y = 150;

  scene.add(roof);
  scene.add(ground);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
  scene.add(ambientLight);

  const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
  sunLight.position.set(0, 100, 100);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 4096;
  sunLight.shadow.mapSize.height = 4096;
  sunLight.shadow.camera.near = 0.5;
  sunLight.shadow.camera.far = 500;
  const d = 100;
  sunLight.shadow.camera.left = -d;
  sunLight.shadow.camera.right = d;
  sunLight.shadow.camera.top = d;
  sunLight.shadow.camera.bottom = -d;
  scene.add(sunLight);

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  scene.background = texture;
}
