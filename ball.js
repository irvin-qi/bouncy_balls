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

    // Separate horizontal movement (x & z) from vertical (y) movement.
    this.horizontal_matrix = Mat4.identity();
    this.vertical_offset = 0;
    this.vertical_velocity = 0;
    this.GRAVITY = 20;         // Gravity acceleration (units/sec²)
    this.JUMP_VELOCITY = 8;      // Upward impulse when jumping.

    // Overall player transformation is computed as:
    // player_matrix = horizontal_matrix * translation(0, vertical_offset, 0)
    this.player_matrix = this.horizontal_matrix.times(Mat4.translation(0, this.vertical_offset, 0));

    // Create a white point light.
    this.light = new Light(vec4(10, 10, 10, 1), color(1, 1, 1, 1), 1000);

    // Obstacles will now be pipes.
    this.obstacles = [];
    this.spawn_timer = 0;
    this.spawn_interval = 1.5;   // Spawn pipes every 1.5 seconds.

    // Movement speeds.
    this.forward_speed = 5.0;    // Constant forward speed (-Z direction).
    this.lateral_speed = 3.0;    // Lateral (left/right) movement speed.

    // Bind global keyboard events so keys work without clicking the UI.
    window.addEventListener("keydown", (e) => {
      if (e.key === "a" || e.key === "ArrowLeft") {
        this.move_left();
      } else if (e.key === "d" || e.key === "ArrowRight") {
        this.move_right();
      } else if (e.key === " ") {
        // Jump when space is pressed.
        this.vertical_velocity = this.JUMP_VELOCITY;
      }
    });
  }

  // Lateral movement affects the horizontal_matrix.
  move_left() {
    this.horizontal_matrix = this.horizontal_matrix.times(
      Mat4.translation(-this.lateral_speed * 0.1, 0, 0)
    );
  }
  move_right() {
    this.horizontal_matrix = this.horizontal_matrix.times(
      Mat4.translation(this.lateral_speed * 0.1, 0, 0)
    );
  }

  // Optional UI buttons.
  make_control_panel() {
    this.key_triggered_button("move left", ["a", "ArrowLeft"], () => this.move_left());
    this.key_triggered_button("move right", ["d", "ArrowRight"], () => this.move_right());
    this.key_triggered_button("jump", [" "], () => { this.vertical_velocity = this.JUMP_VELOCITY; });
  }

  // Spawn obstacles as a pair of pipes that span from floor to ceiling with a gap.
  spawnObstacle() {
    // Define the vertical boundaries.
    const GROUND = 0;
    const CEILING = 10;
    // Increase the gap size from 5 to 7 so that the pipes are further apart.
    const GAP = 7;
    // Pipe dimensions.
    const PIPE_WIDTH = 2;
    const PIPE_DEPTH = 1;

    // Get the player's current world position.
    let playerPos = this.player_matrix.times(vec4(0, 0, 0, 1));
    let spawnDistance = 30;
    let spawn_z = playerPos[2] - spawnDistance;
    // Pipes are centered horizontally.
    let spawn_x = 0;

    // Choose a random gap center ensuring the gap is fully within floor and ceiling.
    let gap_center = (GAP / 2) + Math.random() * (CEILING - GAP);
    // The bottom pipe extends from ground (y=0) to the bottom of the gap.
    let bottom_pipe_height = gap_center - GAP / 2;
    // The top pipe extends from the top of the gap to the ceiling.
    let top_pipe_height = CEILING - (gap_center + GAP / 2);

    // Bottom pipe: center it vertically at half its height.
    let bottomPipeMatrix = Mat4.translation(spawn_x, bottom_pipe_height / 2, spawn_z)
                           .times(Mat4.scale(PIPE_WIDTH, bottom_pipe_height, PIPE_DEPTH));
    // Top pipe: center it so its top touches the ceiling.
    let topPipeMatrix = Mat4.translation(spawn_x, CEILING - top_pipe_height / 2, spawn_z)
                        .times(Mat4.scale(PIPE_WIDTH, top_pipe_height, PIPE_DEPTH));

    // Use a green material for the pipes.
    let pipeMaterial = new Material(new Phong_Shader(), {
      ambient: 0.3, diffusivity: 0.7, specularity: 0.1, color: hex_color("#00AA00")
    });

    let bottomPipe = {
      shape: new defs.Cube(),
      material: pipeMaterial,
      matrix: bottomPipeMatrix
    };

    let topPipe = {
      shape: new defs.Cube(),
      material: pipeMaterial,
      matrix: topPipeMatrix
    };

    this.obstacles.push(bottomPipe);
    this.obstacles.push(topPipe);
  }

  display(context, program_state) {
    let dt = program_state.animation_delta_time / 1000;

    // --- Horizontal Movement: Forward ---
    this.horizontal_matrix = this.horizontal_matrix.times(
      Mat4.translation(0, 0, -this.forward_speed * dt)
    );

    // --- Vertical Physics ---
    this.vertical_velocity -= this.GRAVITY * dt;
    this.vertical_offset += this.vertical_velocity * dt;
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
    // Place the camera behind and above the player.
    let camera_offset = Mat4.translation(0, 2, 10);
    let chase_matrix = this.player_matrix.times(camera_offset);
    program_state.set_camera(Mat4.inverse(chase_matrix));

    // Perspective projection.
    program_state.projection_transform = Mat4.perspective(
      Math.PI / 4, context.width / context.height, 0.1, 2000
    );
    program_state.lights = [ this.light ];

    // --- Draw Pipes (Obstacles) ---
    for (let obstacle of this.obstacles) {
      obstacle.shape.draw(context, program_state, obstacle.matrix, obstacle.material);
    }

    // --- Draw the Player ---
    // Scale down the player's cube so it's a bit smaller.
    let scaledPlayerMatrix = this.player_matrix.times(Mat4.scale(0.5, 0.5, 0.5));
    this.playerShape.draw(context, program_state, scaledPlayerMatrix, this.playerMaterial);
  }
}
