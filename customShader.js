// customShader.js
import * as THREE from 'three';

export function createCustomPhongMaterial(params) {
  // Vertex shader: passes world position, normal, UV, and calculates shadow coordinates.
  const vertexShader = `
    varying vec3 vWorldPosition;
    varying vec3 vWorldNormal;
    varying vec2 vUv;
    varying vec4 vShadowCoord;
    
    uniform mat4 lightMatrix;
    
    void main() {
      vUv = uv;
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      vWorldNormal = normalize(normalMatrix * normal);
      vShadowCoord = lightMatrix * worldPosition;
      gl_Position = projectionMatrix * viewMatrix * worldPosition;
    }
  `;

  // Fragment shader: computes ambient, diffuse, and specular lighting using the halfway vector,
  // applies shadow mapping, and uses a texture if provided.
  // We've modified the shadow factor so that in shadow the scene is only dimmed to 80% brightness.
  const fragmentShader = `
    uniform vec3 uLightPosition;
    uniform vec3 uViewPosition;
    uniform vec3 uAmbientColor;
    uniform vec3 uDiffuseColor;
    uniform vec3 uSpecularColor;
    uniform float uShininess;
    uniform sampler2D uTexture;
    uniform bool useTexture;
    uniform sampler2D uShadowMap;
    
    varying vec3 vWorldPosition;
    varying vec3 vWorldNormal;
    varying vec2 vUv;
    varying vec4 vShadowCoord;
    
    void main() {
      vec3 normal = normalize(vWorldNormal);
      vec3 lightDir = normalize(uLightPosition - vWorldPosition);
      float diff = max(dot(normal, lightDir), 0.0);
      
      vec3 viewDir = normalize(uViewPosition - vWorldPosition);
      vec3 halfwayDir = normalize(lightDir + viewDir);
      float spec = pow(max(dot(normal, halfwayDir), 0.0), uShininess);
      
      vec3 ambient = uAmbientColor;
      vec3 diffuse = uDiffuseColor * diff;
      vec3 specular = uSpecularColor * spec;
      vec3 phong = ambient + diffuse + specular;
      
      // Shadow mapping: determine if the fragment is in shadow.
      float shadowFactor = 1.0;
      vec3 shadowCoord = vShadowCoord.xyz / vShadowCoord.w;
      shadowCoord = shadowCoord * 0.5 + 0.5;
      float closestDepth = texture2D(uShadowMap, shadowCoord.xy).r;
      if (shadowCoord.z > closestDepth + 0.005) {
          // Instead of darkening by 50%, we now darken only by 20%.
          shadowFactor = 0.9;
      }
      phong *= shadowFactor;
      
      if (useTexture) {
          vec4 texColor = texture2D(uTexture, vUv);
          gl_FragColor = vec4(clamp(texColor.rgb * phong, 0.0, 1.0), texColor.a);
      } else {
          gl_FragColor = vec4(clamp(phong, 0.0, 1.0), 1.0);
      }
    }
  `;

  // Set up our uniforms.
  const uniforms = {
    uLightPosition: { value: new THREE.Vector3(0, 100, 100) },
    uViewPosition: { value: new THREE.Vector3(0, 75, 100) },
    uAmbientColor: { value: params.ambientColor || new THREE.Color(0x222222) },
    uDiffuseColor: { value: params.diffuseColor || new THREE.Color(0xffffff) },
    uSpecularColor: { value: params.specularColor || new THREE.Color(0xffffff) },
    uShininess: { value: params.shininess || 30.0 },
    uTexture: { value: params.texture || new THREE.Texture() },
    useTexture: { value: params.texture ? true : false },
    lightMatrix: { value: new THREE.Matrix4() },
    uShadowMap: { value: new THREE.Texture() },
  };

  // Ensure the texture uses mip-mapping if provided.
  if (params.texture) {
    params.texture.minFilter = THREE.LinearMipmapLinearFilter;
    params.texture.generateMipmaps = true;
  }

  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    lights: false,
  });

  return material;
}
