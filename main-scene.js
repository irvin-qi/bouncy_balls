import { defs, tiny } from "./examples/common.js";
// Only import the main character scene (defined in ball.js)
import { MainCharacterScene } from "./ball.js";

const {
  Vector, Vector3, vec, vec3, vec4, color, Matrix, Mat4, Light, Shape, Material, Shader, Texture, Scene,
  Canvas_Widget, Code_Widget, Text_Widget
} = tiny;

// Our main scene is now the game scene defined above.
const Main_Scene = MainCharacterScene;
const Additional_Scenes = [];

export { Main_Scene, Additional_Scenes, Canvas_Widget, Code_Widget, Text_Widget, defs };
