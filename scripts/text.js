import * as THREE from "three";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";

let textMeshes = []; // Store references to the text meshes

const fontURL =
  "https://threejs.org/examples/fonts/helvetiker_bold.typeface.json";

export function displayText(line1, line2, scene) {
  const loader = new FontLoader();
  loader.load(fontURL, function (font) {
    // For Line 1
    const geometry1 = new TextGeometry(line1, {
      font: font,
      size: 4,
      depth: 2,
    });

    geometry1.computeBoundingBox();
    const boundingBox1 = geometry1.boundingBox;
    const textWidth1 = boundingBox1.max.x - boundingBox1.min.x;

    const material1 = new THREE.MeshStandardMaterial({ color: 0xffff00 });
    const textMesh1 = new THREE.Mesh(geometry1, material1);
    textMesh1.position.set(-textWidth1 / 2, 75, 5); // Position the first line of text

    // For Line 2
    const geometry2 = new TextGeometry(line2, {
      font: font,
      size: 1,
      depth: 1,
    });

    geometry2.computeBoundingBox();
    const boundingBox2 = geometry2.boundingBox;
    const textWidth2 = boundingBox2.max.x - boundingBox2.min.x;

    const material2 = new THREE.MeshStandardMaterial({ color: 0xffff00 });
    const textMesh2 = new THREE.Mesh(geometry2, material2);
    textMesh2.position.set(-textWidth2 / 2, 73, 5); // Position the second line of text below the first line

    // Enable shadows on both text meshes
    textMesh1.castShadow = true;
    textMesh1.receiveShadow = true;
    textMesh2.castShadow = true;
    textMesh2.receiveShadow = true;

    // Add both text meshes to the scene
    scene.add(textMesh1);
    scene.add(textMesh2);

    // Store the references of the text meshes for removal later
    textMeshes.push(textMesh1, textMesh2);
  });
}

// Function to remove the text from the scene
export function removeText(scene) {
  textMeshes.forEach((mesh) => {
    scene.remove(mesh);
    mesh.geometry.dispose();
    mesh.material.dispose();
  });
  textMeshes = []; // Clear the stored text meshes
}
