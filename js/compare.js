/* ================================
   PROCESS COMPARISON FOR ALL ALGORITHMS
================================ */

// Find a process in memory by its exact PID
function findProcessInMemory(pid) {
  if (!pid) return null;
  
  for (let i = 0; i < memory.length; i++) {
    if (!memory[i].free && memory[i].pid === pid) {
      return { index: i, block: memory[i] };
    }
  }
  return null;
}

// Test allocation of a process with all algorithms
function compareProcessAlgorithms() {
  let pid = document.getElementById("compareProcessId").value.trim();
  
  if (!pid) {
    showCompareError("Please enter a Process ID");
    return;
  }

  // Find the process in memory (exact match)
  const processInfo = findProcessInMemory(pid);
  
  if (!processInfo) {
    showCompareError(`Process "${pid}" not found in memory. Make sure you enter the exact Process ID as allocated.`);
    return;
  }

  // Get the process size
  const processSize = processInfo.block.size;

  // Test each algorithm with this process size
  const results = {
    firstFit: testFirstFitForSize(processSize),
    nextFit: testNextFitForSize(processSize),
    bestFit: testBestFitForSize(processSize),
    worstFit: testWorstFitForSize(processSize)
  };

  // Display the comparison table
  displayComparisonTable(pid, processSize, results);
}

// Test First Fit for a given size
function testFirstFitForSize(size) {
  for (let i = 0; i < memory.length; i++) {
    if (memory[i].free && memory[i].size >= size) {
      const internalFrag = memory[i].size - size;
      return {
        canAllocate: true,
        blockSize: memory[i].size,
        internalFrag: internalFrag,
        efficiency: ((size / memory[i].size) * 100).toFixed(2)
      };
    }
  }
  return { canAllocate: false };
}

// Test Next Fit for a given size
function testNextFitForSize(size) {
  const n = memory.length;
  let count = 0;
  let index = lastIndex;

  while (count < n) {
    if (memory[index].free && memory[index].size >= size) {
      const internalFrag = memory[index].size - size;
      return {
        canAllocate: true,
        blockSize: memory[index].size,
        internalFrag: internalFrag,
        efficiency: ((size / memory[index].size) * 100).toFixed(2)
      };
    }
    index = (index + 1) % n;
    count++;
  }
  return { canAllocate: false };
}

// Test Best Fit for a given size
function testBestFitForSize(size) {
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
    const internalFrag = memory[bestIndex].size - size;
    return {
      canAllocate: true,
      blockSize: memory[bestIndex].size,
      internalFrag: internalFrag,
      efficiency: ((size / memory[bestIndex].size) * 100).toFixed(2)
    };
  }
  return { canAllocate: false };
}

// Test Worst Fit for a given size
function testWorstFitForSize(size) {
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
    const internalFrag = memory[worstIndex].size - size;
    return {
      canAllocate: true,
      blockSize: memory[worstIndex].size,
      internalFrag: internalFrag,
      efficiency: ((size / memory[worstIndex].size) * 100).toFixed(2)
    };
  }
  return { canAllocate: false };
}

// Display comparison as a table
function displayComparisonTable(pid, processSize, results) {
  const container = document.getElementById("compareTableContainer");
  container.innerHTML = "";

  // Find the best fit (lowest internal fragmentation among successful allocations)
  let bestAlgo = null;
  let minFrag = Infinity;
  Object.entries(results).forEach(([algo, result]) => {
    if (result.canAllocate && result.internalFrag < minFrag) {
      minFrag = result.internalFrag;
      bestAlgo = algo;
    }
  });

  // Create table
  let html = `
    <div class="success-message">✓ Process "${pid}" found with size ${processSize} KB</div>
    <table class="compare-table">
      <thead>
        <tr>
          <th>Algorithm</th>
          <th>Can Allocate</th>
          <th>Block Size (KB)</th>
          <th>Internal Fragment (KB)</th>
          <th>Efficiency (%)</th>
        </tr>
      </thead>
      <tbody>
  `;

  const algorithms = [
    { name: "First Fit", key: "firstFit" },
    { name: "Next Fit", key: "nextFit" },
    { name: "Best Fit", key: "bestFit" },
    { name: "Worst Fit", key: "worstFit" }
  ];

  algorithms.forEach(algo => {
    const result = results[algo.key];
    const isBest = algo.key === bestAlgo;
    
    html += `<tr${isBest ? ' style="background: #fffacd;"' : ""}>
      <td class="algo-name">${algo.name}${isBest ? ' ⭐' : ''}</td>
      <td class="${result.canAllocate ? 'status-success' : 'status-failure'}">
        ${result.canAllocate ? '✓ YES' : '✗ NO'}
      </td>
      <td>${result.canAllocate ? result.blockSize : '-'}</td>
      <td>${result.canAllocate ? result.internalFrag : '-'}</td>
      <td>${result.canAllocate ? result.efficiency + '%' : '-'}</td>
    </tr>`;
  });

  html += `
      </tbody>
    </table>
  `;

  if (bestAlgo) {
    html += `<div class="success-message" style="margin-top: 12px;">⭐ <strong>${algorithms.find(a => a.key === bestAlgo).name}</strong> is most efficient for this process</div>`;
  }

  container.innerHTML = html;
}

// Show error message
function showCompareError(message) {
  const container = document.getElementById("compareTableContainer");
  container.innerHTML = `<div class="error-message">${message}</div>`;
}

// Legacy function for backward compatibility
function simulateAlgorithm(algo, requests) {
  resetMemory();
  let result = [];

  requests.forEach(req => {
    algo(req.pid, req.size);
    result.push(calculateStats().externalFrag);
  });

  return result;
}
