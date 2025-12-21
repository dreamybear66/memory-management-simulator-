let steps = [];
let stepIndex = 0;
let playing = false;

function recordStep() {
  steps.push(JSON.parse(JSON.stringify(memory)));
}

function playSimulation() {
  if (playing) return;
  playing = true;

  const interval = setInterval(() => {
    if (stepIndex >= steps.length) {
      clearInterval(interval);
      playing = false;
      return;
    }
    memory = steps[stepIndex++];
    render();
  }, 700);
}

function pauseSimulation() {
  playing = false;
}
