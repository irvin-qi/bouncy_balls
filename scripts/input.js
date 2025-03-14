export function setupInput(player, gameState, start) {
  const keysPressed = {};

  window.addEventListener("keydown", (event) => {
    keysPressed[event.key.toLowerCase()] = true;
  });

  // might not be best practice to handle jump here
  window.addEventListener("keyup", (event) => {
    keysPressed[event.key.toLowerCase()] = false;
    if (event.code === "Space") {
      if (!gameState.active) {
        start();
      }
      if (player.canJump) {
        player.velocityY = 0.75;
        player.canJump = false;

        setTimeout(() => {
          player.canJump = true;
        }, player.jumpCooldown);
      }
    }
  });

  return keysPressed;
}
