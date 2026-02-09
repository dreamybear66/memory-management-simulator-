
// Global instance
const vmm = new VirtualMemoryManager(512, 8192, 4); // 512B pages, 8KB RAM, 4 TLB entries
let isAnimating = false;

// Mode Switching
function switchMode(mode) {
    const contBtn = document.getElementById('mode-contiguous');
    const virtBtn = document.getElementById('mode-virtual');
    const contView = document.querySelector('.container'); // Existing view
    const virtView = document.getElementById('virtual-memory-view');

    if (mode === 'contiguous') {
        contBtn.classList.add('active');
        virtBtn.classList.remove('active');
        contView.style.display = 'flex';
        virtView.style.display = 'none';
        document.body.style.backgroundColor = ''; // Reset
    } else {
        contBtn.classList.remove('active');
        virtBtn.classList.add('active');
        contView.style.display = 'none';
        virtView.style.display = 'flex'; // Was 'block' but flex in CSS
        initVirtualView();
    }
}

function initVirtualView() {
    renderAll();
    log("Virtual Memory System Initialized. Ready.");
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Setup Virtual Mode Events
    document.getElementById('vm-access-btn').addEventListener('click', handleAccess);
    document.getElementById('vm-reset-btn').addEventListener('click', () => {
        vmm.reset();
        renderAll();
        log("System Reset Complete.");
    });
    document.getElementById('vm-algo-select').addEventListener('change', (e) => {
        vmm.setAlgorithm(e.target.value);
        log(`Algorithm switched to ${e.target.value}`);
    });
});

async function handleAccess() {
    if (isAnimating) return;

    const input = document.getElementById('vm-address-input');
    const hex = input.value.trim();
    if (!hex) return;

    // Parse (Hex or Decimal)
    let logicalAddr = parseInt(hex, 16);
    if (isNaN(logicalAddr)) {
        log("Invalid Address!", "error");
        return;
    }

    // Capture state before access for animation logic
    const initialFaults = vmm.stats.faults;

    // PERFORM ACCESS
    const result = vmm.access(logicalAddr);
    const wasFault = vmm.stats.faults > initialFaults;

    // Log result
    log(`Accessing 0x${logicalAddr.toString(16).toUpperCase()}...`);

    // Start Animation Sequence
    isAnimating = true;
    document.getElementById('vm-access-btn').disabled = true;

    try {
        await visualizeAccess(result, wasFault);
    } catch (e) {
        console.error(e);
    }

    // Update UI after animation
    renderAll();
    isAnimating = false;
    document.getElementById('vm-access-btn').disabled = false;
}

// ================= RENDERING =================

function renderAll() {
    renderStats();
    renderTLB();
    renderPageTable();
    renderRAM();
}

function renderStats() {
    const s = vmm.getMemoryState().stats;
    const total = s.accesses;
    const rate = total === 0 ? 0 : ((s.hits / total) * 100).toFixed(1);

    document.getElementById('vm-hit-rate').innerText = `${rate}%`;
    document.getElementById('vm-fault-count').innerText = s.faults;
}

function renderTLB() {
    const grid = document.getElementById('tlb-grid');
    grid.innerHTML = '';

    // Render 4 slots (fixed size for viz)
    const tlb = vmm.tlb;

    for (let i = 0; i < vmm.tlbSize; i++) {
        const div = document.createElement('div');
        div.className = 'tlb-entry';

        if (tlb[i]) {
            div.innerHTML = `P:${tlb[i].pageNumber}<br>F:${tlb[i].frameNumber}`;
        } else {
            div.innerHTML = '--';
            div.style.color = '#444';
        }
        grid.appendChild(div);
    }
}

function renderPageTable() {
    const list = document.getElementById('pt-list');
    list.innerHTML = '';

    const pt = vmm.pageTable;
    // Show only valid or interesting entries to avoid spamming 1000s
    // Or show top N
    const entries = Object.keys(pt).sort((a, b) => parseInt(a) - parseInt(b));

    if (entries.length === 0) {
        list.innerHTML = '<div style="color:#444; padding:5px;">Table Empty</div>';
        return;
    }

    entries.forEach(pn => {
        const entry = pt[pn];
        const div = document.createElement('div');
        div.className = `pt-entry ${entry.valid ? 'valid' : ''}`;
        div.innerHTML = `
            <span>Page ${pn}</span>
            <span>${entry.valid ? 'Frame ' + entry.frameNumber : 'Disk'}</span>
        `;
        list.appendChild(div);
    });
}

function renderRAM() {
    const grid = document.getElementById('ram-grid');
    grid.innerHTML = '';

    const ram = vmm.physicalMemory;

    ram.forEach((page, idx) => {
        const div = document.createElement('div');
        div.className = `ram-frame ${page !== null ? 'filled' : ''}`;
        div.innerHTML = page !== null ? `P${page}` : '';
        div.title = `Frame ${idx}`;
        grid.appendChild(div);
    });
}

function log(msg, type = 'info') {
    const consoleDiv = document.getElementById('vm-log-console');
    const div = document.createElement('div');
    div.className = `log-entry new ${type}`;
    div.innerText = `> ${msg}`;
    consoleDiv.prepend(div); // Newest top
}

// ================= ANIMATION =================

function getCenter(elementId) {
    const el = document.getElementById(elementId);
    if (!el) return { x: 0, y: 0 };
    const rect = el.getBoundingClientRect();
    return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
    };
}

async function visualizeAccess(result, wasFault) {
    const layer = document.getElementById('vm-animation-layer');
    const packet = document.createElement('div');
    packet.className = 'data-packet';
    layer.appendChild(packet);

    // Helper for movement
    const move = (fromId, toId, duration = 600) => {
        return new Promise(resolve => {
            const start = getCenter(fromId);
            const end = getCenter(toId);

            packet.style.left = `${start.x}px`;
            packet.style.top = `${start.y}px`;

            // Force reflow
            void packet.offsetWidth;

            packet.style.transition = `all ${duration}ms ease-in-out`;
            packet.style.left = `${end.x}px`;
            packet.style.top = `${end.y}px`;

            setTimeout(resolve, duration);
        });
    };

    // 1. CPU -> TLB
    log("Scanning TLB...");
    await move('vis-logical', 'vis-tlb');

    if (result.tlbHit) {
        log("TLB HIT! Direct mapping found.", "success");
        pulseElement('vis-tlb', 'green');

        // TLB -> RAM
        await move('vis-tlb', 'vis-ram');
        pulseElement('vis-ram', 'green');
    } else {
        log("TLB MISS. Checking Page Table...", "warn");
        pulseElement('vis-tlb', 'red');

        // TLB -> Page Table
        await move('vis-tlb', 'vis-pt');

        if (wasFault) {
            log("PAGE FAULT! Page not in memory.", "error");
            pulseElement('vis-pt', 'red');

            // Page Table -> Disk
            log("Fetching from Disk...");
            await move('vis-pt', 'vis-disk');
            pulseElement('vis-disk', 'blue');

            // Disk -> RAM
            log("Loading into RAM Frame " + result.frameNumber);
            await move('vis-disk', 'vis-ram', 800);
            pulseElement('vis-ram', 'green');

            // Update TLB (Animation)
            log("Updating TLB...");
            await move('vis-ram', 'vis-tlb');
        } else {
            log("Page Table HIT. Mapping found.");
            pulseElement('vis-pt', 'green');

            // Page Table -> RAM
            await move('vis-pt', 'vis-ram');
        }
    }

    // Final
    log(`Physical Address: 0x${result.physicalAddress.toString(16).toUpperCase()}`);
    packet.remove();
}

function pulseElement(id, color) {
    const el = document.getElementById(id);
    if (!el) return;

    let borderColor = '#333';
    if (color === 'green') borderColor = 'var(--neon-green)';
    if (color === 'red') borderColor = 'var(--neon-red)';
    if (color === 'blue') borderColor = 'var(--neon-blue)';

    el.style.transition = 'border-color 0.2s, box-shadow 0.2s';
    el.style.borderColor = borderColor;
    el.style.boxShadow = `0 0 20px ${borderColor}`;

    setTimeout(() => {
        el.style.borderColor = '#333';
        el.style.boxShadow = 'none';
    }, 400);
}
