import * as THREE from 'three';
import { initEnvironment } from './scripts/environment.js';
import { createPlayer, updatePlayer } from './scripts/player.js';
import { setupInput } from './scripts/input.js';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 1000);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

initEnvironment(scene, renderer);
const player = createPlayer(scene);
const keysPressed = setupInput(player);

function render(time){
  time *= 0.001;

  updatePlayer(player, keysPressed);

  camera.position.set(player.mesh.position.x, player.mesh.position.y + 5, player.mesh.position.z + 60);
  camera.lookAt(player.mesh.position);
  
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}
requestAnimationFrame(render);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
