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

    // We separate horizontal movement (x and z) from vertical (y).
    this.horizontal_matrix = Mat4.identity();
    this.vertical_offset = 0;
    this.vertical_velocity = 0;
    // Physics constants:
    this.GRAVITY = 20;         // Gravity acceleration (units/sec²).
    this.JUMP_VELOCITY = 8;      // Upward impulse when jump is triggered.
    
    // The overall player transformation will be:
    // player_matrix = horizontal_matrix * translation(0, vertical_offset, 0)
    this.player_matrix = this.horizontal_matrix.times(Mat4.translation(0, this.vertical_offset, 0));

    // Create a white point light.
    this.light = new Light(vec4(10, 10, 10, 1), color(1, 1, 1, 1), 1000);

    // Array to store obstacles.
    this.obstacles = [];
    this.spawn_timer = 0;
    this.spawn_interval = 1.0;   // Spawn an obstacle every 1 second.

    // Speeds (units per second).
    this.forward_speed = 5.0;    // Constant forward speed (along -Z).
    this.lateral_speed = 3.0;    // Lateral (left/right) movement speed.

    // Bind global keyboard events so keys work without clicking the UI.
    window.addEventListener("keydown", (e) => {
      if (e.key === "a" || e.key === "ArrowLeft") {
        this.move_left();
      } else if (e.key === "d" || e.key === "ArrowRight") {
        this.move_right();
      } else if (e.key === " ") {
        // On space press, set vertical velocity to the jump impulse.
        this.vertical_velocity = this.JUMP_VELOCITY;
      }
    });
  }

  // Lateral movement modifies the horizontal_matrix.
  move_left() {
    // Translate left (negative X). Multiply by a small factor (here 0.1) for smooth incremental movement.
    this.horizontal_matrix = this.horizontal_matrix.times(
      Mat4.translation(-this.lateral_speed * 0.1, 0, 0)
    );
  }
  move_right() {
    this.horizontal_matrix = this.horizontal_matrix.times(
      Mat4.translation(this.lateral_speed * 0.1, 0, 0)
    );
  }

  // Optional UI buttons (still available if needed).
  make_control_panel() {
    this.key_triggered_button("move left", ["a", "ArrowLeft"], () => this.move_left());
    this.key_triggered_button("move right", ["d", "ArrowRight"], () => this.move_right());
    this.key_triggered_button("jump", [" "], () => { this.vertical_velocity = this.JUMP_VELOCITY; });
  }

  // Spawn a new obstacle (a gray cube) ahead of the player.
  spawnObstacle() {
    // Compute the player's current world position.
    let playerPos = this.player_matrix.times(vec4(0, 0, 0, 1));
    let spawnDistance = 30; 
    let offsetX = (Math.random() * 8) - 4;  // Random lateral offset.
    let offsetY = 0;
    // Obstacle's world position: lateral offset as chosen; its z is player's z minus spawnDistance.
    let obstaclePos = vec3(offsetX, offsetY, playerPos[2] - spawnDistance);
    let obstacleMatrix = Mat4.identity().times(
      Mat4.translation(obstaclePos[0], obstaclePos[1], obstaclePos[2])
    );
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

    // --- Horizontal Movement: Forward ---
    // Move the horizontal_matrix forward (in -Z).
    this.horizontal_matrix = this.horizontal_matrix.times(
      Mat4.translation(0, 0, -this.forward_speed * dt)
    );

    // --- Vertical Physics: Jump and Gravity ---
    // Apply gravity (decrease vertical velocity).
    this.vertical_velocity -= this.GRAVITY * dt;
    // Update vertical offset based on vertical velocity.
    this.vertical_offset += this.vertical_velocity * dt;
    // Clamp to ground (assume ground level is y = 0).
    if (this.vertical_offset < 0) {
      this.vertical_offset = 0;
      this.vertical_velocity = 0;
    }

    // Combine horizontal and vertical movements.
    this.player_matrix = this.horizontal_matrix.times(
      Mat4.translation(0, this.vertical_offset, 0)
    );

    // --- Obstacle Spawning ---
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

    // --- Chase Camera Setup ---
    // We place the camera behind and above the player.
    let camera_offset = Mat4.translation(0, 2, 10);  // 10 units behind, 2 units up (in player frame)
    let chase_matrix = this.player_matrix.times(camera_offset);
    program_state.set_camera(Mat4.inverse(chase_matrix));

    // Set up perspective projection.
    program_state.projection_transform = Mat4.perspective(
      Math.PI / 4, context.width / context.height, 0.1, 2000
    );
    // Set scene light.
    program_state.lights = [ this.light ];

    // --- Draw Obstacles ---
    for (let obstacle of this.obstacles) {
      obstacle.shape.draw(context, program_state, obstacle.matrix, obstacle.material);
    }

    // --- Draw the Player's Cube ---
    this.playerShape.draw(context, program_state, this.player_matrix, this.playerMaterial);
  }
}
