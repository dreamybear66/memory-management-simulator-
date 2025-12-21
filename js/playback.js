let steps = [];
let stepIndex = 0;
let playing = false;
let playInterval = null;

function recordStep() {
  steps.push(JSON.parse(JSON.stringify(memory)));
}

function playSimulation() {
  if (playing || steps.length === 0) return;

  playing = true;
  stepIndex = 0;

  // Reset graph
  fragChart.data.labels = [];
  fragChart.data.datasets[0].data = [];
  fragChart.update();

  playInterval = setInterval(() => {
    if (stepIndex === steps.length) {
      pauseSimulation();
      return;
    }

    memory = JSON.parse(JSON.stringify(steps[stepIndex]));
    render();

    const stats = calculateStats();
    updateChart(stepIndex + 1, stats.externalFrag);

    stepIndex++;
  }, 700);
}

function pauseSimulation() {
  playing = false;
  clearInterval(playInterval);
}
