class VirtualMemoryManager {
  constructor(pageSize = 1024, totalMemory = 4096, tlbSize = 4) {
    this.pageSize = pageSize;
    this.totalFrames = Math.floor(totalMemory / pageSize);
    this.tlbSize = tlbSize;
    
    this.pageTable = {}; // Map: pageNumber -> { frameToken, valid, dirty, accessed, loadedAt, lastAccessTime }
    this.tlb = []; // Array of { pageNumber, frameNumber, lastAccessTime }
    this.physicalMemory = new Array(this.totalFrames).fill(null); // Array of pageNumbers or null
    
    this.stats = {
      hits: 0,
      misses: 0,
      faults: 0,
      accesses: 0
    };

    this.replacementAlgo = 'FIFO'; // Default
    this.clockPointer = 0; // For Clock algorithm
  }

  reset() {
    this.pageTable = {};
    this.tlb = [];
    this.physicalMemory.fill(null);
    this.stats = { hits: 0, misses: 0, faults: 0, accesses: 0 };
    this.clockPointer = 0;
  }

  setAlgorithm(algo) {
    if (['FIFO', 'LRU', 'Optimal', 'Clock'].includes(algo)) {
      this.replacementAlgo = algo;
    }
  }

  // Access memory at logical address
  access(logicalAddress) {
    this.stats.accesses++;
    const pageNumber = Math.floor(logicalAddress / this.pageSize);
    const offset = logicalAddress % this.pageSize;
    
    let frameNumber = -1;
    let tlbHit = false;

    // 1. Check TLB
    const tlbEntry = this.tlb.find(entry => entry.pageNumber === pageNumber);
    if (tlbEntry) {
      tlbHit = true;
      this.stats.hits++;
      frameNumber = tlbEntry.frameNumber;
      this.updatePageTableAccess(pageNumber); // Update access bit/time
      this.updateTLBAccess(tlbEntry); // For LRU TLB replacement
    } else {
      // TLB Miss
      this.stats.misses++;
      
      // 2. Check Page Table
      if (this.pageTable[pageNumber] && this.pageTable[pageNumber].valid) {
        frameNumber = this.pageTable[pageNumber].frameNumber;
        this.updatePageTableAccess(pageNumber);
      } else {
        // Page Fault
        this.stats.faults++;
        frameNumber = this.handlePageFault(pageNumber);
      }

      // Update TLB
      this.updateTLB(pageNumber, frameNumber);
    }

    const physicalAddress = (frameNumber * this.pageSize) + offset;
    
    return {
      logicalAddress,
      physicalAddress,
      pageNumber,
      frameNumber,
      offset,
      tlbHit,
      isPageFault: !tlbHit && (!this.pageTable[pageNumber] || !this.pageTable[pageNumber].valid) 
      // Note: isPageFault logic here is a bit tricky since we already handled it. 
      // Better to return the status of the *initial* check.
      // Refined return object below.
    };
  }

  handlePageFault(pageNumber) {
    let frameNumber = -1;

    // 1. Check for free frame
    const freeFrameIndex = this.physicalMemory.indexOf(null);
    if (freeFrameIndex !== -1) {
      frameNumber = freeFrameIndex;
    } else {
      // 2. No free frame, execute replacement
      frameNumber = this.executeReplacement();
    }

    // Update Physical Memory
    this.physicalMemory[frameNumber] = pageNumber;

    // Update Page Table
    this.pageTable[pageNumber] = {
      frameNumber: frameNumber,
      valid: true,
      dirty: false, // Default clean
      accessed: true,
      loadedAt: Date.now(),
      lastAccessTime: Date.now()
    };

    return frameNumber;
  }

  executeReplacement() {
    let victimFrame = -1;
    let victimPage = -1;

    // Helper to get entries currently in memory
    const loadedPages = Object.keys(this.pageTable)
      .filter(p => this.pageTable[p].valid)
      .map(p => ({ ...this.pageTable[p], pageNumber: parseInt(p) }));

    switch (this.replacementAlgo) {
      case 'FIFO':
        // Oldest loadedAt
        loadedPages.sort((a, b) => a.loadedAt - b.loadedAt);
        victimPage = loadedPages[0].pageNumber;
        break;

      case 'LRU':
        // Oldest lastAccessTime
        loadedPages.sort((a, b) => a.lastAccessTime - b.lastAccessTime);
        victimPage = loadedPages[0].pageNumber;
        break;
      
      case 'Optimal':
         // Needs future knowledge. For simulation, we might need a trace or lookahead.
         // If "interactive" mode, we simulate it by random or generic "future" (faking it is common in interactive simple sims).
         // BUT, usually Optimal looks at *future* request string.
         // Since this is real-time interactive, "Optimal" is impossible to implement strictly correctly without a pre-defined reference string.
         // We will fallback to LRU or a random replacement and note it, OR look at a provided "Process Stream" if available.
         // For now, let's fallback to LRU and adding a TODO: "Requires Reference String"
         // Actually, let's implement a 'Random' fallback or 'LRU' for now if strictly interactive.
         // Let's use LRU logic for now as best effort since future is unknown.
         loadedPages.sort((a, b) => a.lastAccessTime - b.lastAccessTime);
         victimPage = loadedPages[0].pageNumber;
         break;

      case 'Clock':
         while (true) {
             const candidateFrame = this.clockPointer;
             const candidatePage = this.physicalMemory[candidateFrame];
             const entry = this.pageTable[candidatePage];

             if (entry.accessed) {
                 entry.accessed = false; // Give second chance
                 this.clockPointer = (this.clockPointer + 1) % this.totalFrames;
             } else {
                 victimPage = candidatePage;
                 this.clockPointer = (this.clockPointer + 1) % this.totalFrames;
                 break; // Found victim
             }
         }
         break;
    }

    victimFrame = this.pageTable[victimPage].frameNumber;
    
    // Invalidate victim
    this.pageTable[victimPage].valid = false;
    this.invalidateTLB(victimPage);
    
    return victimFrame;
  }

  updateTLB(pageNumber, frameNumber) {
    // If already in TLB, update (should be covered by updateTLBAccess but good for safety)
    const index = this.tlb.findIndex(e => e.pageNumber === pageNumber);
    if (index !== -1) {
      this.tlb[index].frameNumber = frameNumber;
      this.tlb[index].lastAccessTime = Date.now();
      return;
    }

    // If TLB full, remove one (FIFO for TLB usually)
    if (this.tlb.length >= this.tlbSize) {
      this.tlb.shift(); 
    }

    this.tlb.push({
      pageNumber,
      frameNumber,
      lastAccessTime: Date.now()
    });
  }

  updatePageTableAccess(pageNumber) {
    if (this.pageTable[pageNumber]) {
        this.pageTable[pageNumber].accessed = true;
        this.pageTable[pageNumber].lastAccessTime = Date.now();
    }
  }

  updateTLBAccess(entry) {
    entry.lastAccessTime = Date.now();
    // Allow re-ordering for LRU policy in TLB if desired, ensuring most recent is at end?
    // tlb.shift() removes start. So pushing to end keeps it 'new'.
    // Remove and push to end.
    const idx = this.tlb.indexOf(entry);
    if (idx > -1) {
        this.tlb.splice(idx, 1);
        this.tlb.push(entry);
    }
  }

  invalidateTLB(pageNumber) {
    const idx = this.tlb.findIndex(e => e.pageNumber === pageNumber);
    if (idx !== -1) {
      this.tlb.splice(idx, 1);
    }
  }

  getMemoryState() {
      return {
          physicalMemory: this.physicalMemory,
          pageTable: this.pageTable,
          tlb: this.tlb,
          stats: this.stats
      };
  }
}
