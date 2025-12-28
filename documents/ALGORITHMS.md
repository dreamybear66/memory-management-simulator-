# Memory Allocation Algorithms - Quick Reference Guide

## Algorithm Comparison Table

| Algorithm | Time | Space | Pros | Cons | Best For |
|-----------|------|-------|------|------|----------|
| **First Fit** | O(n) | O(n) | Fast, simple | Fragmentation | Quick allocation |
| **Best Fit** | O(n) | O(n) | Minimize waste | Slower | Memory-constrained |
| **Worst Fit** | O(n) | O(n) | Large blocks | Still fragments | Flexible future alloc |
| **Next Fit** | O(n)* | O(n) | Even distribution | Circular search | Load distribution |

*Distributed across allocations

---

## Algorithm Pseudocode

### First Fit
```
function FirstFit(processSize):
    for each block in memory:
        if block.isFree and block.size >= processSize:
            allocate(block, processSize)
            return SUCCESS
    return FAILURE
```

### Best Fit
```
function BestFit(processSize):
    bestBlock = NULL
    bestSize = INFINITY
    
    for each block in memory:
        if block.isFree and block.size >= processSize:
            if block.size < bestSize:
                bestBlock = block
                bestSize = block.size
    
    if bestBlock != NULL:
        allocate(bestBlock, processSize)
        return SUCCESS
    return FAILURE
```

### Worst Fit
```
function WorstFit(processSize):
    worstBlock = NULL
    largestSize = -1
    
    for each block in memory:
        if block.isFree and block.size >= processSize:
            if block.size > largestSize:
                worstBlock = block
                largestSize = block.size
    
    if worstBlock != NULL:
        allocate(worstBlock, processSize)
        return SUCCESS
    return FAILURE
```

### Next Fit
```
function NextFit(processSize):
    startPointer = nextFitPointer
    
    // Search from pointer to end
    for i = nextFitPointer to blockCount-1:
        if memory[i].isFree and memory[i].size >= processSize:
            allocate(memory[i], processSize)
            nextFitPointer = (i + 1) % blockCount
            return SUCCESS
    
    // Wrap around to beginning
    for i = 0 to nextFitPointer-1:
        if memory[i].isFree and memory[i].size >= processSize:
            allocate(memory[i], processSize)
            nextFitPointer = (i + 1) % blockCount
            return SUCCESS
    
    return FAILURE
```

---

## Block Splitting Example

### Scenario: Allocate 300 KB to P1 in 1000 KB free block

**Before:**
```
┌─────────────────────────┐
│   FREE: 1000 KB        │
└─────────────────────────┘
```

**After:**
```
┌──────────────────┬─────────────────┐
│  ALLOCATED (P1)  │  FREE: 700 KB   │
│    300 KB        │                 │
└──────────────────┴─────────────────┘
```

**Code:**
```javascript
if (block.size > requiredSize) {
    // Split: create allocated block
    block.size = requiredSize;
    block.processId = "P1";
    block.isFree = false;
    
    // Create free block for leftover
    newBlock.size = 1000 - 300; // 700 KB
    newBlock.isFree = true;
    insertAfter(block, newBlock);
}
```

---

## Memory Coalescing Example

### Scenario: Deallocate P2 from fragmented memory

**Before (Fragmented):**
```
┌───────────┬──────────┬────────────────┬────────┐
│ P1: 200KB │ P2: 300  │ FREE: 250 KB   │ P3:... │
│ ALLOC     │ ALLOC    │                │        │
└───────────┴──────────┴────────────────┴────────┘
```

**After deallocating P2:**
```
┌───────────┬──────────┬────────────────┬────────┐
│ P1: 200KB │ FREE:300 │ FREE: 250 KB   │ P3:... │
│ ALLOC     │          │                │        │
└───────────┴──────────┴────────────────┴────────┘
```

**After Coalescing:**
```
┌───────────┬──────────────────────────┬────────┐
│ P1: 200KB │ FREE: 550 KB            │ P3:... │
│ ALLOC     │ (merged adjacent blocks) │        │
└───────────┴──────────────────────────┴────────┘
```

**Code:**
```javascript
function coalesceMemory() {
    let i = 0;
    while (i < blocks.length - 1) {
        if (blocks[i].isFree && blocks[i+1].isFree) {
            // Merge
            blocks[i].size += blocks[i+1].size;
            blocks.remove(i+1);
            // Don't increment i, check for more merges
        } else {
            i++;
        }
    }
}
```

---

## Fragmentation Examples

### Internal Fragmentation
Wasted space WITHIN allocated blocks

```
┌──────────────────┬────────┐
│  ALLOCATED (P1)  │ WASTE  │
│    300 KB        │ 50 KB  │
│  (process uses   │ (unused│
│    only 300)     │ in     │
│                  │ block) │
└──────────────────┴────────┘
   Block size: 350 KB
   Internal Fragmentation: 50 KB
```

### External Fragmentation
Free memory split into unusable blocks

```
┌──────────┬─────────┬──────────┬─────────┐
│ P1: 100  │ FREE:50 │  P2: 100 │ FREE:50 │
└──────────┴─────────┴──────────┴─────────┘
  
  Total Free: 100 KB
  Largest Free Block: 50 KB
  External Fragmentation: 100 - 50 = 50 KB
  
  ❌ Cannot allocate 75 KB despite 100 KB free!
```

---

## Fragmentation Calculation

### Formula: Internal Fragmentation
```
Internal Fragmentation = Sum of (block_size - process_size)
                        for each allocated block

Example:
  Block 1: 350 KB for P1 (300 KB) → waste = 50 KB
  Block 2: 300 KB for P2 (275 KB) → waste = 25 KB
  Total Internal Fragmentation = 75 KB
```

### Formula: External Fragmentation
```
External Fragmentation = Total Free Memory - Largest Free Block

Example:
  Free block 1: 200 KB
  Free block 2: 150 KB
  Free block 3: 100 KB
  
  Total Free = 450 KB
  Largest Free = 200 KB
  External Fragmentation = 450 - 200 = 250 KB
  
  Impact: Cannot allocate 300 KB despite having enough total free!
```

---

## Algorithm Decision Tree

```
                    Need to Allocate Memory?
                              |
                    Is speed critical?
                         /          \
                      YES            NO
                       |              |
                 First Fit      Need small blocks?
                                 /       \
                              YES        NO
                               |         |
                          Best Fit   Need flexibility?
                                      /       \
                                   YES        NO
                                    |         |
                              Worst Fit   Next Fit
```

---

## Performance Analysis

### Time Complexity
- **First Fit:** Best = O(1), Avg = O(n), Worst = O(n)
- **Best Fit:** Avg = O(n), Worst = O(n) [full scan always]
- **Worst Fit:** Avg = O(n), Worst = O(n) [full scan always]
- **Next Fit:** Distributed O(n) across allocations

### Space Complexity
- All algorithms: **O(n)** for storing blocks

### Memory Efficiency
- **Best Fit:** Most efficient (minimizes waste)
- **First Fit:** Reasonably efficient
- **Worst Fit:** Least efficient for waste
- **Next Fit:** Depends on allocation pattern

---

## Key Takeaways

1. **No perfect algorithm** - each has trade-offs
2. **First Fit** - simplest, fastest in most cases
3. **Best Fit** - best for memory conservation
4. **Worst Fit** - best for future flexibility
5. **Next Fit** - best for even distribution
6. **Coalescing** - essential for reducing external fragmentation
7. **Compaction** - eliminates fragmentation but is expensive

---

## Interview Questions & Answers

**Q: What's the difference between internal and external fragmentation?**
A: Internal = wasted space within allocated blocks. External = free space split across multiple blocks.

**Q: When would you choose Best Fit over First Fit?**
A: When memory is limited and you want to minimize waste in allocated blocks.

**Q: How does Next Fit improve distribution?**
A: By distributing allocations across memory rather than clustering at the start, reducing concentration of allocations.

**Q: Why is compaction expensive?**
A: It requires moving all allocated blocks and updating all pointers/addresses, which takes O(n) time.

**Q: Which algorithm is most commonly used?**
A: First Fit - due to its simplicity and good average performance.

---

*Last Updated: December 2025*
