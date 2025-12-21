function calculateStats() {
  let used = 0;
  let free = 0;
  let active = 0;
  let freeBlocks = [];

  memory.forEach(block => {
    if (block.free) {
      free += block.size;
      freeBlocks.push(block.size);
    } else {
      used += block.size;
      active++;
    }
  });

  const largestFree = freeBlocks.length
    ? Math.max(...freeBlocks)
    : 0;

  const externalFrag = free - largestFree;

  return {
    total: TOTAL_MEMORY,
    used,
    free,
    active,
    largestFree,
    externalFrag
  };
}
