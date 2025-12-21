function render() {
  renderMemory();
  renderStats();

  if (typeof steps !== "undefined") {
    const stats = calculateStats();
    updateChart(steps.length, stats.externalFrag);
  }
}

function renderMemory() {
  const mem = document.getElementById("memory");
  mem.innerHTML = "";

  memory.forEach(b => {
    const div = document.createElement("div");
    div.className = `block ${b.free ? "free" : "used"}`;

    // VERTICAL MEMORY (correct)
    div.style.height = `${(b.size / TOTAL_MEMORY) * 100}%`;

    div.innerHTML = b.free
      ? `FREE<br>${b.size} KB`
      : `${b.pid}<br>${b.size} KB`;

    mem.appendChild(div);
  });
}

function renderStats() {
  const s = calculateStats();
  document.getElementById("stats").innerHTML = `
    <div class="stat">Total<br>${s.total} KB</div>
    <div class="stat">Used<br>${s.used} KB</div>
    <div class="stat">Free<br>${s.free} KB</div>
    <div class="stat">Active<br>${s.active}</div>
    <div class="stat red">External Frag<br>${s.externalFrag}</div>
    <div class="stat">Largest Free<br>${s.largestFree}</div>
  `;
}

function highlightBlock(index) {
  const blocks = document.querySelectorAll(".block");
  blocks.forEach(b => (b.style.outline = "none"));

  if (blocks[index]) {
    blocks[index].style.outline = "3px solid yellow";
  }
}
