import * as THREE from 'three'

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const camera = new THREE.PerspectiveCamera( 35, window.innerWidth / window.innerHeight, 0.1, 1000 );

camera.position.set(0, 60, 60);camera
camera.lookAt(0, 60, 0);


const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const geometry = new THREE.SphereGeometry( 3 , 32, 16 ); 
const material = new THREE.MeshPhongMaterial( { color: 0x90EE90 } ); 
const sphere = new THREE.Mesh( geometry, material ); 
sphere.position.y = 60;

const groundGeometry = new THREE.PlaneGeometry(200, 200);
const groundMaterial = new THREE.MeshPhongMaterial({ color: 0x808080 });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

scene.add( sphere );


// LIGHTING
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
sunLight.position.set(0, 100, -100);  // Sun shines from behind
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
sphere.castShadow = true;
ground.receiveShadow = true;

const keysPressed = {};
const moveSpeed = 0.5;


window.addEventListener('keydown', (event) => {
  keysPressed[event.key.toLowerCase()] = true;
  console.log(event.key.toLowerCase())
});

let canJump = true;
let jumpCooldown = 80;

window.addEventListener('keyup', (event) => {
  keysPressed[event.key.toLowerCase()] = false;
  if (event.code === 'Space' && canJump) {
    velocityY = 0.8; 
    canJump = false; 

    setTimeout(() => {
      canJump = true;
    }, jumpCooldown);
  }
});

let velocityY = 0;
let gravity = -0.98;

function render(time){
    time *= 0.001

    sphere.rotation.x = time;
    sphere.rotation.y = time;   

    if (keysPressed['a'] && sphere.position.x > -100) {
        sphere.position.x -= moveSpeed;
      }
    if (keysPressed['d'] && sphere.position.x < 100) {
        sphere.position.x += moveSpeed;
    }

    velocityY += gravity * 0.02;
    sphere.position.y += velocityY;
    
    if (sphere.position.y - 3 <= 0) { // 15 is radius of sphere
        sphere.position.y = 3;
        velocityY = 0;
    }
    
    camera.position.set(sphere.position.x, sphere.position.y + 5, sphere.position.z + 60);
    camera.lookAt(sphere.position);
      
    renderer.render(scene, camera);
 
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onWindowResize, false);   