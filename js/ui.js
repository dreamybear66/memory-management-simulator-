function render() {
  renderMemory();
  renderStats();
  updateAlgorithmDescription();
}


function renderMemory() {
  const mem = document.getElementById("memory");
  mem.innerHTML = "";

  memory.forEach(b => {
    const div = document.createElement("div");
    
    // Add class based on allocation type
    if (b.free) {
      div.className = "block free";
    } else {
      div.className = `block used allocated-${b.allocatedBy || 'sample'}`;
    }

    // HORIZONTAL GANTT CHART - Calculate width based on memory proportion
    const widthPercent = (b.size / TOTAL_MEMORY) * 100;
    div.style.width = `${widthPercent}%`;

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

// Algorithm Descriptions
const algorithmDescriptions = {
  first: {
    name: "First Fit",
    description: "Allocates memory to the first free block that is large enough. Simple and fast, but may leave small fragments."
  },
  next: {
    name: "Next Fit",
    description: "Starts searching from the last allocation point instead of the beginning. Reduces search time and distributes fragmentation more evenly."
  },
  best: {
    name: "Best Fit",
    description: "Finds the smallest free block that can fit the process. Minimizes wasted space and reduces fragmentation, but slower search."
  },
  worst: {
    name: "Worst Fit",
    description: "Allocates to the largest available free block. Leaves the remaining space large, but may cause severe external fragmentation."
  }
};

function updateAlgorithmDescription() {
  const algo = document.getElementById("algorithm").value;
  const descDiv = document.getElementById("algorithmDescription");
  
  if (algorithmDescriptions[algo]) {
    const desc = algorithmDescriptions[algo];
    descDiv.innerHTML = `<strong>${desc.name}:</strong> ${desc.description}`;
  }
}

// Initialize chart on page load
document.addEventListener("DOMContentLoaded", () => {
  initChart();
  render();
  updateAlgorithmDescription();
});
