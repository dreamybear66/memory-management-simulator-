function render() {
  renderMemory();
  renderStats();
  renderQueue();
}

const queueNodeMap = new Map();

function renderQueue() {
  const ul = document.getElementById('queue-list');
  if (!ul) return;

  // Fast path: if the queue is empty, clear everything
  if (!processQueue || processQueue.length === 0) {
    ul.innerHTML = '';
    queueNodeMap.clear();
    return;
  }

  const currentPids = new Set(processQueue.map(i => i.pid));

  // Remove DOM nodes that are no longer in the queue
  for (const [pid, node] of queueNodeMap) {
    if (!currentPids.has(pid)) {
      if (node.parentNode) node.parentNode.removeChild(node);
      queueNodeMap.delete(pid);
    }
  }

  // Ensure DOM order matches processQueue (newest first)
  processQueue.forEach((item, idx) => {
    let li = queueNodeMap.get(item.pid);
    if (!li) {
      li = document.createElement('li');
      li.className = 'queue-item';
      li.dataset.pid = item.pid;

      const left = document.createElement('div'); left.className = 'queue-left';
      const pidSpan = document.createElement('span'); pidSpan.className = 'queue-pid'; pidSpan.innerText = item.pid;
      const sizeSpan = document.createElement('span'); sizeSpan.className = 'queue-size'; sizeSpan.innerText = item.size ? `${item.size} KB` : '';
      left.appendChild(pidSpan); left.appendChild(sizeSpan);

      const right = document.createElement('div'); right.className = 'queue-right';
      const algoSpan = document.createElement('span'); algoSpan.className = 'queue-algo'; algoSpan.innerText = item.algo ? item.algo : '';
      const statusSpan = document.createElement('span'); statusSpan.className = `queue-status ${item.status}`; statusSpan.innerText = item.status;
      const timeSpan = document.createElement('span'); timeSpan.className = 'queue-time'; timeSpan.style.marginLeft = '6px'; timeSpan.style.fontSize = '11px'; timeSpan.style.opacity = '0.7'; timeSpan.innerText = new Date(item.time).toLocaleTimeString();

      right.appendChild(algoSpan); right.appendChild(statusSpan); right.appendChild(timeSpan);

      li.appendChild(left); li.appendChild(right);

      queueNodeMap.set(item.pid, li);
    } else {
      // Update changed fields only
      const statusSpan = li.querySelector('.queue-status');
      if (statusSpan) {
        statusSpan.className = `queue-status ${item.status}`;
        statusSpan.innerText = item.status;
      }
      const algoSpan = li.querySelector('.queue-algo'); if (algoSpan) algoSpan.innerText = item.algo ? item.algo : '';
      const sizeSpan = li.querySelector('.queue-size'); if (sizeSpan) sizeSpan.innerText = item.size ? `${item.size} KB` : '';
      const timeSpan = li.querySelector('.queue-time'); if (timeSpan) timeSpan.innerText = new Date(item.time).toLocaleTimeString();
    }

    // Ensure correct order in the UL
    const existingAtIdx = ul.children[idx];
    if (existingAtIdx !== li) {
      if (idx >= ul.children.length) ul.appendChild(li);
      else ul.insertBefore(li, ul.children[idx]);
    }
  });
}


const COLORS = [
  '#ff8a80', '#ffab91', '#ffd180', '#fff59d', '#c5e1a5', '#80deea', '#b39ddb', '#90caf9', '#f48fb1', '#ce93d8', '#a5d6a7', '#ffcc80'
];

const pidColorMap = {};

const PREDEFINED_COLORS = {
  P1: '#f44336', // red
  P2: '#2196f3', // blue
  P3: '#4caf50', // green
  P4: '#9c27b0'  // purple
};

const ALGO_COLORS = {
  first: '#ff7043', // orange for First Fit (kept)
  next: '#00b8a9',  // teal for Next Fit (distinct from blue)
  best: '#ffb300',  // amber for Best Fit (distinct from green)
  worst: '#6d4c41'  // brown for Worst Fit (distinct from purple)
};

function getColorForPid(pid) {
  if (!pid) return '#d3d3d3';

  // Return predefined colors for known PIDs
  if (PREDEFINED_COLORS[pid]) {
    pidColorMap[pid] = PREDEFINED_COLORS[pid];
    return PREDEFINED_COLORS[pid];
  }

  if (!pidColorMap[pid]) {
    // Assign next available color that is not already used by predefined PIDs
    const usedColors = new Set(Object.values(PREDEFINED_COLORS).concat(Object.values(pidColorMap)));
    let idx = 0;
    while (usedColors.has(COLORS[idx % COLORS.length])) idx++;
    pidColorMap[pid] = COLORS[idx % COLORS.length];
  }
  return pidColorMap[pid];
}

function getContrastColor(hex) {
  if (!hex) return '#000';
  const c = hex.replace('#','');
  const r = parseInt(c.substring(0,2),16);
  const g = parseInt(c.substring(2,4),16);
  const b = parseInt(c.substring(4,6),16);
  const yiq = (r*299 + g*587 + b*114)/1000;
  return yiq >= 128 ? '#000' : '#fff';
}

function renderLegend() {
  const legend = document.getElementById('memory-legend');
  if (!legend) return;
  legend.innerHTML = '';

  // FREE
  const freeItem = document.createElement('div');
  freeItem.className = 'legend-item';
  freeItem.innerHTML = `<div class="legend-swatch" style="background:#d3d3d3;border:1px solid #999"></div><div class="legend-label">FREE</div>`;
  legend.appendChild(freeItem);

  // Allocation algorithm colors
  Object.keys(ALGO_COLORS).forEach(k => {
    const item = document.createElement('div');
    item.className = 'legend-item';
    const label = k === 'first' ? 'First Fit' : k === 'next' ? 'Next Fit' : k === 'best' ? 'Best Fit' : 'Worst Fit';
    item.innerHTML = `<div class="legend-swatch" style="background:${ALGO_COLORS[k]}"></div><div class="legend-label">Allocated by ${label}</div>`;
    legend.appendChild(item);
  });

  // Show predefined PIDs next
  Object.keys(PREDEFINED_COLORS).forEach(pid => {
    const item = document.createElement('div');
    item.className = 'legend-item';
    item.innerHTML = `<div class="legend-swatch" style="background:${PREDEFINED_COLORS[pid]}"></div><div class="legend-label">${pid}</div>`;
    legend.appendChild(item);
  });

  // Then show any dynamically assigned PIDs (skip predefined)
  Object.keys(pidColorMap).forEach(pid => {
    if (PREDEFINED_COLORS[pid]) return;
    const item = document.createElement('div');
    item.className = 'legend-item';
    item.innerHTML = `<div class="legend-swatch" style="background:${pidColorMap[pid]}"></div><div class="legend-label">${pid}</div>`;
    legend.appendChild(item);
  });
}

function renderMemory() {
  const mem = document.getElementById("memory");
  mem.innerHTML = "";

  // Horizontal Gantt chart: each block width proportional to its size
  memory.forEach((b, idx) => {
    const div = document.createElement("div");
    div.className = `block ${b.free ? "free" : "used"}`;

    // HORIZONTAL GANTT: width proportional to size
    div.style.width = `${(b.size / TOTAL_MEMORY) * 100}%`;
    div.style.height = `100%`;

    // Determine background color:
    // 1) Predefined PID colors (P1..P4)
    // 2) If not predefined and block has algo, use algorithm color
    // 3) Otherwise fallback to a per-PID assigned color
    const bg = b.free ? '#d3d3d3' : (PREDEFINED_COLORS[b.pid] || (b.algo ? ALGO_COLORS[b.algo] : getColorForPid(b.pid)));
    const textColor = getContrastColor(bg);
    div.style.background = bg;
    div.style.color = textColor;

    const label = document.createElement("div");
    label.className = "label";
    label.innerText = b.free ? "FREE" : b.pid;

    const size = document.createElement("div");
    size.className = "size";
    size.innerText = `${b.size} KB`;

    div.appendChild(label);
    div.appendChild(size);

    div.title = b.free ? `FREE - ${b.size} KB` : `${b.pid} - ${b.size} KB`;

    mem.appendChild(div);

    // After the element is appended and layout happens, decide what to show for narrow blocks
    // Use requestAnimationFrame to ensure layout values are available and adjust accordingly
    requestAnimationFrame(() => {
      const w = div.offsetWidth;

      // mark as small if really narrow
      if (w < 36) {
        div.classList.add('small');
      } else {
        div.classList.remove('small');
      }

      if (b.free) {
        // For free blocks, prioritize showing 'FREE' and size; hide size only if extremely narrow
        if (w < 22) {
          label.innerText = 'FREE';
          label.classList.add('abbrev');
          size.style.display = 'none';
        } else {
          label.innerText = 'FREE';
          label.classList.remove('abbrev');
          size.style.display = '';
        }
      } else {
        // For used blocks, show PID and size; abbreviate PID when narrow
        if (w < 28) {
          label.innerText = b.pid ? b.pid.slice(0, 3) : '';
          label.classList.add('abbrev');
          size.style.display = 'none';
        } else {
          label.innerText = b.pid;
          label.classList.remove('abbrev');
          size.style.display = '';
        }
      }

      // always keep full details available on hover
      div.title = b.free ? `FREE - ${b.size} KB` : `${b.pid} - ${b.size} KB`;

      // update legend after measurements so pidColorMap is populated
      renderLegend();
    });

  });

  // Render timeline ticks under the chart (0 -> TOTAL_MEMORY)
  const ticksContainer = document.getElementById("memory-ticks");
  if (ticksContainer) {
    ticksContainer.innerHTML = "";
    const numTicks = 10;
    for (let i = 0; i <= numTicks; i++) {
      const t = document.createElement("div");
      t.className = "tick";
      t.style.width = `${100 / numTicks}%`;
      const value = Math.round((i / numTicks) * TOTAL_MEMORY);
      t.innerText = `${value} KB`;
      ticksContainer.appendChild(t);
    }
  }
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
