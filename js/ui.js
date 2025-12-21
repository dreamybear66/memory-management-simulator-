function render() {
  renderMemory();
  renderStats();


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

  const usedPercent = ((s.used / s.total) * 100).toFixed(2);
  const freePercent = ((s.free / s.total) * 100).toFixed(2);

  // External fragmentation % relative to total free memory
  const externalFragPercent = s.free > 0
    ? ((s.externalFrag / s.free) * 100).toFixed(2)
    : "0.00";

  document.getElementById("stats").innerHTML = `
    <div class="stat">
      Total<br>${s.total} KB
    </div>

    <div class="stat">
      Used<br>${s.used} KB<br>(${usedPercent}%)
    </div>

    <div class="stat">
      Free<br>${s.free} KB<br>(${freePercent}%)
    </div>

    <div class="stat">
      Active<br>${s.active}
    </div>

    <div class="stat red">
      External Frag<br>${s.externalFrag} KB<br>
      (${externalFragPercent}% of free)
    </div>

    <div class="stat">
      Largest Free<br>${s.largestFree} KB
    </div>
  `;
}


function highlightBlock(index) {
  const blocks = document.querySelectorAll(".block");
  blocks.forEach(b => (b.style.outline = "none"));

  if (blocks[index]) {
    blocks[index].style.outline = "3px solid yellow";
  }
}

// Initialize chart on page load
document.addEventListener("DOMContentLoaded", () => {
  initChart();
  render();
});
