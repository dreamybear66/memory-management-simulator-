function allocateBlock(index, pid, size) {
  const block = memory[index];
  const remaining = block.size - size;

  memory.splice(index, 1, {
    size,
    free: false,
    pid
  });

  if (remaining > 0) {
    memory.splice(index + 1, 0, {
      size: remaining,
      free: true,
      pid: null
    });
  }
}

/* ================= FIRST FIT ================= */
function firstFit(pid, size) {
  for (let i = 0; i < memory.length; i++) {
    if (memory[i].free && memory[i].size >= size) {
      highlightBlock(i);

      setTimeout(() => {
        allocateBlock(i, pid, size);
        render();
      }, 600);

      return true;
    }
  }
  return false;
}

/* ================= NEXT FIT ================= */
function nextFit(pid, size) {
  const n = memory.length;
  let count = 0;

  while (count < n) {
    if (memory[lastIndex].free && memory[lastIndex].size >= size) {
      highlightBlock(lastIndex);

      setTimeout(() => {
        allocateBlock(lastIndex, pid, size);
        render();
      }, 600);

      return true;
    }

    lastIndex = (lastIndex + 1) % n;
    count++;
  }
  return false;
}

/* ================= BEST FIT ================= */
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
      allocateBlock(bestIndex, pid, size);
      render();
    }, 600);

    return true;
  }
  return false;
}

/* ================= WORST FIT ================= */
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
      allocateBlock(worstIndex, pid, size);
      render();
    }, 600);

    return true;
  }
  return false;
}
