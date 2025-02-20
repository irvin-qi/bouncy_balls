import { defs, tiny } from "./examples/common.js";

const {
  Vector, Vector3, vec, vec3, vec4, color, hex_color,
  Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture
} = tiny;

const { Phong_Shader } = defs;

export class MainCharacterScene extends Scene {
  constructor() {
    super();

    // The player's cube (red) represents you.
    this.playerShape = new defs.Cube();
    this.playerMaterial = new Material(new Phong_Shader(), {
      ambient: 0.5, diffusivity: 0.6, specularity: 0.2, color: hex_color("#FF0000")
    });

    // Initialize the player's transformation.
    this.player_matrix = Mat4.identity();

    // Create a white point light.
    this.light = new Light(vec4(10, 10, 10, 1), color(1, 1, 1, 1), 1000);

    // Array to store obstacles.
    this.obstacles = [];
    this.spawn_timer = 0;
    this.spawn_interval = 1.0;

    // Speeds (units per second).
    this.forward_speed = 5.0;   // Constant forward speed.
    this.lateral_speed = 3.0;   // Lateral movement speed.

    // Bind keyboard events globally so keys work without clicking the UI.
    window.addEventListener("keydown", (e) => {
      // Use both key names for robustness.
      if (e.key === "a" || e.key === "ArrowLeft") {
        this.move_left();
      } else if (e.key === "d" || e.key === "ArrowRight") {
        this.move_right();
      }
    });
  }

  // Move the player left.
  move_left() {
    // Apply a translation in the -X direction (scaled by a small factor).
    this.player_matrix = this.player_matrix.times(Mat4.translation(-this.lateral_speed * 0.1, 0, 0));
  }
  // Move the player right.
  move_right() {
    this.player_matrix = this.player_matrix.times(Mat4.translation(this.lateral_speed * 0.1, 0, 0));
  }

  // Optional: Also keep the UI buttons active.
  make_control_panel() {
    this.key_triggered_button("move left", ["a", "ArrowLeft"], () => this.move_left());
    this.key_triggered_button("move right", ["d", "ArrowRight"], () => this.move_right());
  }

  // Spawn a new obstacle (gray cube) ahead of the player.
  spawnObstacle() {
    let playerPos = this.player_matrix.times(vec4(0, 0, 0, 1));
    let spawnDistance = 30;
    let offsetX = (Math.random() * 8) - 4;
    let offsetY = 0;
    let obstaclePos = vec3(offsetX, offsetY, playerPos[2] - spawnDistance);
    let obstacleMatrix = Mat4.identity().times(Mat4.translation(obstaclePos[0], obstaclePos[1], obstaclePos[2]));
    let obstacleMaterial = new Material(new Phong_Shader(), {
      ambient: 0.3, diffusivity: 0.7, specularity: 0.1, color: hex_color("#888888")
    });
    let obstacle = {
      shape: new defs.Cube(),
      material: obstacleMaterial,
      matrix: obstacleMatrix
    };
    this.obstacles.push(obstacle);
  }

  display(context, program_state) {
    let dt = program_state.animation_delta_time / 1000;

    // Move the player forward (in -Z direction).
    this.player_matrix = this.player_matrix.times(Mat4.translation(0, 0, -this.forward_speed * dt));

    // Update obstacle spawn timer.
    this.spawn_timer += dt;
    if (this.spawn_timer > this.spawn_interval) {
      this.spawnObstacle();
      this.spawn_timer = 0;
    }

    // Remove obstacles that have passed behind the player.
    let playerPos = this.player_matrix.times(vec4(0, 0, 0, 1));
    this.obstacles = this.obstacles.filter(obstacle => {
      let obsPos = obstacle.matrix.times(vec4(0, 0, 0, 1));
      return obsPos[2] < playerPos[2] + 5;
    });

    // --- Set Up a Chase Camera ---
    // We position the camera behind and above the player.
    let camera_offset = Mat4.translation(0, 2, 10);  // 10 units behind, 2 units up (in player's frame)
    let chase_matrix = this.player_matrix.times(camera_offset);
    program_state.set_camera(Mat4.inverse(chase_matrix));

    // Perspective projection.
    program_state.projection_transform = Mat4.perspective(
      Math.PI / 4, context.width / context.height, 0.1, 2000
    );

    program_state.lights = [ this.light ];

    // Draw obstacles.
    for (let obstacle of this.obstacles) {
      obstacle.shape.draw(context, program_state, obstacle.matrix, obstacle.material);
    }

    // Draw the player's cube so you can see your own box.
    this.playerShape.draw(context, program_state, this.player_matrix, this.playerMaterial);
  }
}
