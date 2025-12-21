function allocateProcess() {
  const pid = document.getElementById("pid").value;
  const size = parseInt(document.getElementById("size").value);
  const algo = document.getElementById("algorithm").value;

  if (!pid || isNaN(size) || size <= 0) {
    alert("Enter valid Process ID and Size");
    return;
  }

  // record state BEFORE allocation (for playback)
  if (typeof recordStep === "function") {
    recordStep();
  }

  let success = false;

  switch (algo) {
    case "first":
      success = firstFit(pid, size);
      break;
    case "next":
      success = nextFit(pid, size);
      break;
    case "best":
      success = bestFit(pid, size);
      break;
    case "worst":
      success = worstFit(pid, size);
      break;
  }

  if (!success) {
    alert("Allocation Failed: Not enough memory");
  }
}

/* =========================
    DEALLOCATE PROCESS
========================= */
function deallocateProcess() {
  const pid = document.getElementById("pid").value;

  if (!pid) {
    alert("Enter Process ID to deallocate");
    return;
  }

  let found = false;

  memory.forEach(block => {
    if (!block.free && block.pid === pid) {
      block.free = true;
      block.pid = null;
      found = true;
    }
  });

  if (!found) {
    alert("Process not found in memory");
    return;
  }

  mergeFreeBlocks();
  render();
}


/* =========================
   COMPACT MEMORY
========================= */
function compactMemory() {
  const usedBlocks = memory.filter(b => !b.free);
  const freeSize = memory
    .filter(b => b.free)
    .reduce((sum, b) => sum + b.size, 0);

  memory = [...usedBlocks];

  if (freeSize > 0) {
    memory.push({
      size: freeSize,
      free: true,
      pid: null
    });
  }

  render();
}

/* =========================
   RESET MEMORY
========================= */
function resetMemory() {
  memory = JSON.parse(JSON.stringify(INITIAL_MEMORY));
  lastIndex = 0;

  if (typeof steps !== "undefined") {
    steps.length = 0;
    stepIndex = 0;
  }

  if (typeof fragChart !== "undefined") {
    fragChart.data.labels = [];
    fragChart.data.datasets[0].data = [];
    fragChart.update();
  }

  render();
}


function mergeFreeBlocks() {
  for (let i = 0; i < memory.length - 1; i++) {
    if (memory[i].free && memory[i + 1].free) {
      memory[i].size += memory[i + 1].size;
      memory.splice(i + 1, 1);
      i--; // recheck
    }
  }
}
