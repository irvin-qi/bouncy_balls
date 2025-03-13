import * as THREE from "three";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";

let textMesh = null; // Store reference to the text mesh

export function displayText(text, scene) {
  const loader = new FontLoader();
  loader.load(
    "https://threejs.org/examples/fonts/helvetiker_regular.typeface.json",
    function (font) {
      if (textMesh) scene.remove(textMesh); // Remove existing text before adding new one

      const geometry = new TextGeometry(text, {
        font: font,
        size: 5,
        depth: 5,
      });

      geometry.computeBoundingBox();
      const boundingBox = geometry.boundingBox;
      const textWidth = boundingBox.max.x - boundingBox.min.x;

      const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
      textMesh = new THREE.Mesh(geometry, material);

      // Center the text by shifting it left by half its width
      textMesh.position.set(-textWidth / 2, 75, 0);

      scene.add(textMesh);
    }
  );
}

// Function to remove text from the scene
export function removeText(scene) {
  if (textMesh) {
    scene.remove(textMesh);
    textMesh.geometry.dispose();
    textMesh.material.dispose();
    textMesh = null;
  }
}
