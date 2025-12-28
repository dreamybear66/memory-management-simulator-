# Memory Management Simulator - Complete Implementation

## 📋 Project Overview

A comprehensive **browser-based Memory Management Simulator** with interactive visualization and multiple allocation algorithms. Includes corresponding **C implementations** for educational purposes.

**Features:**
- 4 allocation algorithms (First Fit, Best Fit, Worst Fit, Next Fit)
- Real-time memory visualization
- Detailed fragmentation tracking (internal + external)
- Block-by-block allocation highlighting
- Interactive web interface with animations
- Standalone C programs for OS lab vivas

---

## 🎯 Allocation Algorithms Implemented

### 1. **First Fit** ⚡
- **Strategy:** Scan from beginning, allocate to first fitting block
- **Time:** O(n) — single pass
- **Pros:** Fast, simple, minimal overhead
- **Cons:** Can lead to external fragmentation
- **Best for:** Quick allocations, average-case scenarios

### 2. **Best Fit** 🎯
- **Strategy:** Find smallest free block that fits the process
- **Time:** O(n) — full scan required
- **Pros:** Minimizes wasted space in allocated blocks
- **Cons:** Slower, requires scanning entire memory
- **Best for:** Memory-constrained systems wanting to reduce waste

### 3. **Worst Fit** 📦
- **Strategy:** Find largest free block that fits the process
- **Time:** O(n) — full scan required
- **Pros:** Leaves large free blocks for future allocations
- **Cons:** Slower, can still lead to fragmentation
- **Best for:** Systems needing flexibility for large future allocations

### 4. **Next Fit** 🔄
- **Strategy:** Maintain pointer to last allocation, search from there
- **Time:** O(n) — distributed across allocations
- **Pros:** Better distribution, faster average case
- **Cons:** Circular search, still prone to fragmentation
- **Best for:** Even distribution of allocations across memory

---

## 📊 Fragmentation Tracking

The simulator accurately calculates and displays:

### **Internal Fragmentation**
- Wasted space **within allocated blocks**
- Calculated as: `(allocated_block_size - process_size)`
- Shown per-process and in total
- Appears as yellow indicator on memory blocks

### **External Fragmentation**
- Free memory **split across multiple blocks**
- Calculated as: `total_free_memory - largest_free_block`
- Prevents large allocations despite sufficient total free memory
- Reduced by coalescing adjacent free blocks

### **Total Fragmentation**
- Sum of internal + external fragmentation
- Comprehensive view of memory waste

---

## 🌐 Web Interface Features

### **Controls**
- Algorithm selector (dropdown with all 4 options)
- Process ID input
- Memory size input
- Smart buttons with input validation
  - Allocate button: enabled only with both fields filled
  - Deallocate button: enabled with valid Process ID

### **Memory Visualization**
- Dynamic memory blocks displayed as bars
- Color coding:
  - 🟢 **Green:** Allocated memory
  - ⚪ **Grey:** Free memory
- Proportional height based on block size
- Recent allocations highlighted with pulse animation
- Shows internal fragmentation indicator

### **Statistics Panel**
- Total Memory
- Used Memory (with percentage)
- Free Memory (with percentage)
- Active Processes count
- Largest Free Block
- **Internal Fragmentation** (with percentage)
- **External Fragmentation** (with percentage)
- **Total Fragmentation** (with percentage)

### **User Experience**
- Real-time memory visualization updates
- Smooth animations on allocation
- Clear status messages explaining algorithm choices
- Auto-dismissing notifications with color coding
- Memory coalescing on deallocation
- Responsive layout with card-based design

---

## 💻 C Implementation Files

### **Files Included**
1. `first_fit.c` — First Fit algorithm with demonstrations
2. `best_fit.c` — Best Fit algorithm with comparisons
3. `worst_fit.c` — Worst Fit algorithm with advantages shown
4. `next_fit.c` — Next Fit algorithm with pointer tracking

### **C Program Features**
- **Hardcoded array-based storage** (no dynamic allocation)
- **Array size:** 100 blocks max
- **Memory size:** 10240 KB (same as web version)
- **Clear comments** explaining each step
- **Multiple demonstration scenarios** per algorithm
- **Detailed output** showing:
  - Memory layout with block numbers
  - Allocation decisions and reasoning
  - Statistics after each operation
  - Fragmentation demonstration

### **Compiling C Programs**
```bash
# First Fit
gcc -o first_fit first_fit.c && ./first_fit

# Best Fit
gcc -o best_fit best_fit.c && ./best_fit

# Worst Fit
gcc -o worst_fit worst_fit.c && ./worst_fit

# Next Fit
gcc -o next_fit next_fit.c && ./next_fit
```

### **Viva Explanation Points**
The C code clearly demonstrates:
1. ✅ Memory block structure and linked list concepts
2. ✅ Allocation algorithm logic (loops, comparisons)
3. ✅ Block splitting and coalescing
4. ✅ Fragmentation calculations
5. ✅ Deallocation and memory management
6. ✅ Pointer arithmetic and array manipulation

---

## 🔧 Implementation Details

### **JavaScript (script.js)**
```javascript
// Global tracking
let memoryBlocks = [];          // Array of blocks
let processFragmentation = {};  // Track per-process fragmentation
let nextFitIndex = 0;           // For Next Fit algorithm
let lastAllocatedBlockIndex = -1; // For highlighting
```

### **Block Structure**
```javascript
{
  size: number,                    // Block size in KB
  processId: string or null,       // Allocated process ID
  isFree: boolean,                 // Free or allocated
  internalFragmentation: number    // Wasted space in block
}
```

### **Algorithm Functions**
- `findFirstFit(size)` — Linear scan from beginning
- `findBestFit(size)` — Find smallest fitting block
- `findWorstFit(size)` — Find largest fitting block
- `findNextFit(size)` — Search from pointer with wrap-around
- `coalesceMemory()` — Merge adjacent free blocks
- `compactMemory()` — Move all allocated blocks to front

---

## 🎓 Educational Value

### **For Operating Systems Course**
- **Memory Management Concepts:** Allocation, deallocation, fragmentation
- **Algorithm Comparison:** Trade-offs between different strategies
- **Data Structures:** Arrays, linked lists, pointers
- **Visualization:** Real-time understanding of memory layout
- **Hands-on Practice:** Interactive experimentation
- **C Implementation:** Low-level memory management

### **Demonstration Scenarios**
Each C program includes:
1. Basic allocation scenarios
2. Algorithm advantages/disadvantages comparison
3. External fragmentation demonstration
4. Deallocation and coalescing
5. Block splitting and merging
6. Complex multi-process scenarios

---

## 🚀 Quick Start

### **Running the Web Simulator**
```bash
# Open in browser
open index.html
# or
firefox index.html
# or
chrome index.html
```

### **Using the Simulator**
1. Select an algorithm from dropdown
2. Enter Process ID (e.g., P1, P2)
3. Enter Memory Size in KB
4. Click "Allocate" to allocate memory
5. Click "Deallocate" to free memory
6. Click "Compact Memory" to reduce fragmentation
7. Watch statistics and visualization update in real-time

### **Experimentation Ideas**
- Compare fragmentation between algorithms
- Allocate processes of different sizes
- Deallocate to create gaps
- Use compact memory to eliminate external fragmentation
- Observe how Next Fit distributes allocations differently

---

## 📁 Project Structure

```
memory_management-simulator/
├── index.html           # Web interface structure
├── styles.css          # All styling and animations
├── script.js           # Allocation algorithms & logic
├── first_fit.c         # First Fit C implementation
├── best_fit.c          # Best Fit C implementation
├── worst_fit.c         # Worst Fit C implementation
├── next_fit.c          # Next Fit C implementation
├── memory_simulator.c  # Reference implementation (10240 KB version)
└── README.md          # This file
```

---

## 🎨 Visual Design

- **Modern dark theme** with white cards
- **Smooth animations** on allocation/deallocation
- **Responsive layout:** Works on desktop and tablet
- **Color-coded blocks:** Green (allocated), Grey (free)
- **Real-time highlights:** Pulse effect on newly allocated blocks
- **Clear typography:** Easy to read status messages

---

## ✨ Key Features Implemented

✅ All 4 allocation algorithms with correct logic  
✅ Accurate fragmentation tracking (internal + external)  
✅ Block highlighting on allocation  
✅ Memory coalescing on deallocation  
✅ Step-by-step explanation messages  
✅ Input validation with button state management  
✅ Smooth CSS animations  
✅ Responsive web design  
✅ Complete C implementations for learning  
✅ Detailed comments for OS lab viva explanation  

---

## 🔍 Testing & Validation

All algorithms have been tested with:
- Basic allocation scenarios
- Block splitting and merging
- Edge cases (exact fit, no space)
- Multiple sequential allocations
- Deallocation and coalescing
- Fragmentation scenarios
- Compaction effectiveness

---

## 📚 References & Concepts

**Operating System Topics:**
- Contiguous Memory Allocation
- Dynamic Memory Management
- Fragmentation (Internal & External)
- Block Allocation Algorithms
- Memory Coalescing
- First Fit, Best Fit, Worst Fit, Next Fit

**Data Structures Used:**
- Arrays (for block storage)
- Linked Lists (conceptually in memory)
- Pointers (in C implementation)

---

## 🎯 Future Enhancements

Possible additions:
- Buddy system allocation
- Paging and segmentation
- Virtual memory simulation
- Memory protection visualization
- Page replacement algorithms
- Cache simulation

---

## 👨‍💼 Academic Use

This simulator is suitable for:
- **OS Course Labs:** Memory management assignment
- **Viva Preparation:** Explain C code and algorithms
- **Interview Prep:** System design, memory concepts
- **Research:** Visualization of allocation strategies
- **Teaching:** Student understanding of memory concepts

---

## 📝 License & Credits

Created as an educational memory management simulator.
Free for academic and learning purposes.

---

**Last Updated:** December 2025

For questions or improvements, refer to the code comments and algorithm descriptions above.
