import * as THREE from "three";
import sky from "/assets/sky.avif";
import grass from "/assets/grass.png";
import { displayText } from "./text";

export function initEnvironment(scene, renderer) {
  displayText("BOUNCY BALL", "PRESS SPACE TO BEGIN", scene);
  const geometry = new THREE.PlaneGeometry(200, 5000);

  const skyTexture = new THREE.TextureLoader().load(sky);
  const grassTexture = new THREE.TextureLoader().load(grass);
  grassTexture.wrapS = THREE.RepeatWrapping;
  grassTexture.wrapT = THREE.RepeatWrapping;
  grassTexture.repeat.set(200, 200);
  skyTexture.repeat.set(1, 0.9);

  const roofMaterial = new THREE.MeshPhongMaterial({ color: 0x3f9b0b });
  const grassMaterial = new THREE.MeshPhongMaterial({
    map: grassTexture,
  });
  const ground = new THREE.Mesh(geometry, grassMaterial);
  const roof = new THREE.Mesh(geometry, roofMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;

  roof.rotation.x = Math.PI / 2;
  roof.position.y = 150;

  scene.add(roof);
  scene.add(ground);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
  scene.add(ambientLight);

  const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
  sunLight.position.set(100, 100, 50);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 4096;
  sunLight.shadow.mapSize.height = 4096;
  sunLight.shadow.camera.near = 0.5;
  sunLight.shadow.camera.far = 500;
  
  const d = 1000; 
  sunLight.shadow.camera.left = -d;
  sunLight.shadow.camera.right = d;
  sunLight.shadow.camera.top = d;
  sunLight.shadow.camera.bottom = -d;
  
  scene.add(sunLight);

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  scene.background = skyTexture;

  return { ground, roof, sunLight };
}
