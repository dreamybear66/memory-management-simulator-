/* ================================
   HELPER: Allocate Block
================================ */
function allocateBlock(index, pid, size, allocatedBy = null) {
  const block = memory[index];
  const remaining = block.size - size;

  // Replace free block with allocated block
  memory.splice(index, 1, {
    size: size,
    free: false,
    pid: pid,
    allocatedBy: allocatedBy
  });

  // Insert remaining free block if any
  if (remaining > 0) {
    memory.splice(index + 1, 0, {
      size: remaining,
      free: true,
      pid: null,
      allocatedBy: null
    });
  }
}

/* ================================
   FIRST FIT
================================ */
function firstFit(pid, size) {
  for (let i = 0; i < memory.length; i++) {
    if (memory[i].free && memory[i].size >= size) {

      highlightBlock(i);

      setTimeout(() => {
        allocateBlock(i, pid, size, "firstFit");
        render();

        const stats = calculateStats();
        updateChart(fragChart.data.labels.length + 1, stats.externalFrag);

        // ✅ RECORD FINAL STATE AFTER ALLOCATION
        recordStep();

      }, 500);

      return true;
    }
  }
  return false;
}


/* ================================
   NEXT FIT (FIXED)
================================ */
function nextFit(pid, size) {
  const n = memory.length;
  let count = 0;

  while (count < n) {
    if (memory[lastIndex].free && memory[lastIndex].size >= size) {

      const allocIndex = lastIndex; // preserve index
      highlightBlock(allocIndex);

      setTimeout(() => {
        allocateBlock(allocIndex, pid, size, "nextFit");

        // ✅ UPDATE lastIndex AFTER allocation
        lastIndex = allocIndex + 1;
        if (lastIndex >= memory.length) lastIndex = 0;

        render();

        const stats = calculateStats();
        updateChart(fragChart.data.labels.length + 1, stats.externalFrag);

        // ✅ RECORD FINAL STATE AFTER ALLOCATION
        recordStep();
      }, 500);

      return true;
    }

    lastIndex = (lastIndex + 1) % n;
    count++;
  }

  return false;
}

/* ================================
   BEST FIT
================================ */
function bestFit(pid, size) {
  let bestIndex = -1;
  let minDiff = Infinity;

  for (let i = 0; i < memory.length; i++) {
    if (memory[i].free && memory[i].size >= size) {
      const diff = memory[i].size - size;
      if (diff < minDiff) {
        minDiff = diff;
        bestIndex = i;
      }
    }
  }

  if (bestIndex !== -1) {
    highlightBlock(bestIndex);

    setTimeout(() => {
      allocateBlock(bestIndex, pid, size, "bestFit");
      render();

      const stats = calculateStats();
      updateChart(fragChart.data.labels.length + 1, stats.externalFrag);

      // ✅ RECORD FINAL STATE AFTER ALLOCATION
        recordStep();
    }, 500);

    return true;
  }

  return false;
}

/* ================================
   WORST FIT
================================ */
function worstFit(pid, size) {
  let worstIndex = -1;
  let maxSize = -1;

  for (let i = 0; i < memory.length; i++) {
    if (memory[i].free && memory[i].size >= size) {
      if (memory[i].size > maxSize) {
        maxSize = memory[i].size;
        worstIndex = i;
      }
    }
  }

  if (worstIndex !== -1) {
    highlightBlock(worstIndex);

    setTimeout(() => {
      allocateBlock(worstIndex, pid, size, "worstFit");
      render();

      const stats = calculateStats();
      updateChart(fragChart.data.labels.length + 1, stats.externalFrag);

      // ✅ RECORD FINAL STATE AFTER ALLOCATION
        recordStep();
        
    }, 500);

    return true;
  }

  return false;
}
