function calculateStats() {
  let used = 0, free = 0, internal = 0, active = 0;

  memory.forEach(b => {
    if (b.free) free += b.size;
    else {
      used += b.size;
      active++;
      if (b.internal) internal += b.internal;
    }
  });

  return {
    total: TOTAL_MEMORY,
    used,
    free,
    active,
    externalFrag: free,
    internalFrag: internal,
    largestFree: Math.max(...memory.filter(b => b.free).map(b => b.size), 0)
  };
}
