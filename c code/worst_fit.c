// ============================================================================
// WORST FIT MEMORY ALLOCATION ALGORITHM - C Implementation
// ============================================================================
// Algorithm: Scan entire memory and allocate to the LARGEST free block
//            that can accommodate the process.
//
// Time Complexity: O(n) - full scan required to find largest
// Space Complexity: O(n) - for storing memory blocks
//
// Pros: Leaves large free blocks available for future allocations
// Cons: Slower than First Fit, can still lead to fragmentation
// ============================================================================

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define TOTAL_MEMORY 10240  // Total memory in KB
#define MAX_BLOCKS 100      // Maximum number of memory blocks
#define MAX_PROCESS_ID 10   // Max characters in process ID

// ============================================================================
// MEMORY BLOCK STRUCTURE
// ============================================================================
typedef struct {
    int size;                      // Size of block in KB
    int isFree;                    // 1 = free, 0 = allocated
    char processId[MAX_PROCESS_ID]; // Process ID (empty if free)
} MemoryBlock;

// Global memory blocks array
MemoryBlock memory[MAX_BLOCKS];
int blockCount = 0;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Initialize memory as one large free block
 */
void initializeMemory() {
    blockCount = 0;
    memory[blockCount].size = TOTAL_MEMORY;
    memory[blockCount].isFree = 1;
    strcpy(memory[blockCount].processId, "");
    blockCount++;
    
    printf("✓ Memory initialized: %d KB free\n\n", TOTAL_MEMORY);
}

/**
 * Display the entire memory layout
 */
void displayMemoryLayout() {
    printf("\n========== MEMORY LAYOUT (WORST FIT) ==========\n");
    printf("%-8s %-15s %-12s %-15s\n", "Block#", "Size (KB)", "Status", "Process ID");
    printf("---------------------------------------------\n");

    for (int i = 0; i < blockCount; i++) {
        printf("%-8d %-15d %-12s %-15s\n",
               i + 1,
               memory[i].size,
               memory[i].isFree ? "FREE" : "ALLOCATED",
               memory[i].isFree ? "---" : memory[i].processId);
    }
    printf("==========================================\n");
}

/**
 * Display memory statistics
 */
void displayStatistics() {
    int usedMemory = 0;
    int freeMemory = 0;
    int activeProcesses = 0;
    int largestFreeBlock = 0;

    for (int i = 0; i < blockCount; i++) {
        if (memory[i].isFree) {
            freeMemory += memory[i].size;
            if (memory[i].size > largestFreeBlock) {
                largestFreeBlock = memory[i].size;
            }
        } else {
            usedMemory += memory[i].size;
            activeProcesses++;
        }
    }

    int externalFragmentation = freeMemory - largestFreeBlock;

    printf("\n========== STATISTICS ==========\n");
    printf("Total Memory:              %d KB\n", TOTAL_MEMORY);
    printf("Used Memory:               %d KB (%.1f%%)\n",
           usedMemory, (usedMemory * 100.0) / TOTAL_MEMORY);
    printf("Free Memory:               %d KB (%.1f%%)\n",
           freeMemory, (freeMemory * 100.0) / TOTAL_MEMORY);
    printf("Active Processes:          %d\n", activeProcesses);
    printf("Largest Free Block:        %d KB\n", largestFreeBlock);
    printf("External Fragmentation:    %d KB (%.1f%%)\n",
           externalFragmentation, (externalFragmentation * 100.0) / TOTAL_MEMORY);
    printf("================================\n");
}

// ============================================================================
// WORST FIT ALLOCATION ALGORITHM
// ============================================================================

/**
 * WORST FIT: Allocate memory to process
 *
 * Steps:
 * 1. Validate process ID and size
 * 2. Check if process already exists
 * 3. Scan ALL blocks to find worst fit
 * 4. Track the LARGEST block that fits
 * 5. If found, allocate (split if necessary)
 * 6. If not found, return failure
 *
 * Why Worst Fit?
 * - Leaves largest possible free block after allocation
 * - Provides more flexibility for future large allocations
 * - Avoids breaking large blocks into small unusable pieces
 *
 * @return: 1 if successful, 0 if failed
 */
int allocateWorstFit(char *processId, int requiredSize) {
    // Validation: size must be positive and within total memory
    if (requiredSize <= 0 || requiredSize > TOTAL_MEMORY) {
        printf("✗ Invalid size: %d KB\n", requiredSize);
        return 0;
    }

    // Check if process already exists
    for (int i = 0; i < blockCount; i++) {
        if (!memory[i].isFree && strcmp(memory[i].processId, processId) == 0) {
            printf("✗ Process %s already allocated\n", processId);
            return 0;
        }
    }

    // Check array bounds
    if (blockCount >= MAX_BLOCKS - 1) {
        printf("✗ Memory block limit reached\n");
        return 0;
    }

    // WORST FIT: Scan ALL blocks to find the LARGEST suitable block
    int worstIndex = -1;
    int largestSize = -1; // Track largest size found

    for (int i = 0; i < blockCount; i++) {
        // If block is free AND can fit the process
        if (memory[i].isFree && memory[i].size >= requiredSize) {
            // If this block is larger than previous largest, update
            if (memory[i].size > largestSize) {
                largestSize = memory[i].size;
                worstIndex = i;
            }
        }
    }

    // Check if suitable block was found
    if (worstIndex == -1) {
        printf("✗ [Worst Fit] Cannot allocate %d KB to %s (no suitable block found)\n\n",
               requiredSize, processId);
        return 0;
    }

    printf("  [Worst Fit] Found worst-fit block %d (size %d KB) at position %d\n",
           worstIndex + 1, memory[worstIndex].size, worstIndex);
    printf("  This is the LARGEST block that can fit the process\n");

    // Allocate to worst fit block
    if (memory[worstIndex].size > requiredSize) {
        // Block is larger: SPLIT into allocated + free
        int leftoverSize = memory[worstIndex].size - requiredSize;

        // Shift blocks to make room for new free block
        for (int j = blockCount; j > worstIndex + 1; j--) {
            memory[j] = memory[j - 1];
        }

        // Set allocated block
        memory[worstIndex].size = requiredSize;
        memory[worstIndex].isFree = 0;
        strcpy(memory[worstIndex].processId, processId);

        // Set leftover free block (large, for future allocations)
        memory[worstIndex + 1].size = leftoverSize;
        memory[worstIndex + 1].isFree = 1;
        strcpy(memory[worstIndex + 1].processId, "");

        blockCount++;
    } 
    // Exact fit: no split needed
    else {
        memory[worstIndex].isFree = 0;
        strcpy(memory[worstIndex].processId, processId);
    }

    printf("✓ [Worst Fit] Allocated %d KB to %s\n\n", requiredSize, processId);
    return 1;
}

/**
 * Deallocate memory from a process
 */
int deallocateMemory(char *processId) {
    for (int i = 0; i < blockCount; i++) {
        if (!memory[i].isFree && strcmp(memory[i].processId, processId) == 0) {
            memory[i].isFree = 1;
            strcpy(memory[i].processId, "");
            printf("✓ Deallocated process %s\n", processId);
            return 1;
        }
    }

    printf("✗ Process %s not found\n", processId);
    return 0;
}

/**
 * Coalesce adjacent free blocks
 */
void coalesceMemory() {
    int i = 0;
    while (i < blockCount - 1) {
        if (memory[i].isFree && memory[i + 1].isFree) {
            // Merge adjacent free blocks
            memory[i].size += memory[i + 1].size;

            // Remove next block by shifting
            for (int j = i + 1; j < blockCount - 1; j++) {
                memory[j] = memory[j + 1];
            }
            blockCount--;
            // Don't increment i, continue checking for more merges
        } else {
            i++;
        }
    }
}

// ============================================================================
// MAIN - DEMONSTRATION OF WORST FIT
// ============================================================================

int main() {
    printf("\n");
    printf("╔═══════════════════════════════════════════════════════════╗\n");
    printf("║   WORST FIT MEMORY ALLOCATION - C Implementation          ║\n");
    printf("║              Total Memory: 10240 KB                       ║\n");
    printf("╚═══════════════════════════════════════════════════════════╝\n\n");

    initializeMemory();

    // ========== SCENARIO 1: Basic Allocation ==========
    printf("--- SCENARIO 1: Basic Allocation with Worst Fit ---\n");
    allocateWorstFit("P1", 200);
    allocateWorstFit("P2", 150);
    allocateWorstFit("P3", 100);
    displayMemoryLayout();
    displayStatistics();

    // ========== SCENARIO 2: Show Worst Fit advantage ==========
    printf("\n--- SCENARIO 2: Worst Fit Advantage ---\n");
    initializeMemory();
    printf("Allocating with Worst Fit to maximize large free blocks:\n");
    allocateWorstFit("Q1", 500);  // [500] [9740]
    allocateWorstFit("Q2", 400);  // [500] [400] [9340]
    allocateWorstFit("Q3", 300);  // [500] [400] [300] [9040]
    printf("\nNow deallocate Q1 and Q2:\n");
    deallocateMemory("Q1");
    deallocateMemory("Q2");
    coalesceMemory();
    displayMemoryLayout();
    printf("\nNow try to allocate Q4 (700 KB) and Q5 (600 KB):\n");
    allocateWorstFit("Q4", 700);  // Uses the 900 KB block (worst fit)
    allocateWorstFit("Q5", 600);  // Uses the next largest
    displayMemoryLayout();
    displayStatistics();

    // ========== SCENARIO 3: Comparison scenario ==========
    printf("\n--- SCENARIO 3: Worst Fit vs Best Fit ---\n");
    initializeMemory();
    printf("Both algorithms starting with same scenario:\n");
    allocateWorstFit("R1", 1000);
    allocateWorstFit("R2", 800);
    allocateWorstFit("R3", 1200);
    allocateWorstFit("R4", 600);
    displayMemoryLayout();
    displayStatistics();

    printf("\nDeallocating R2:\n");
    deallocateMemory("R2");
    displayMemoryLayout();
    printf("\nWorst Fit will prefer the 800 KB block (largest available)\n");
    allocateWorstFit("R5", 750);
    displayMemoryLayout();
    displayStatistics();

    // ========== SCENARIO 4: Large allocation scenario ==========
    printf("\n--- SCENARIO 4: Large Memory Allocations ---\n");
    initializeMemory();
    allocateWorstFit("S1", 2000);
    allocateWorstFit("S2", 1500);
    allocateWorstFit("S3", 2500);
    deallocateMemory("S2");
    coalesceMemory();
    printf("\nAfter deallocating S2 (1500 KB), trying to allocate S4 (1400 KB):\n");
    allocateWorstFit("S4", 1400);
    displayMemoryLayout();
    displayStatistics();

    printf("\n╔═══════════════════════════════════════════════════════════╗\n");
    printf("║               Worst Fit Simulation Complete               ║\n");
    printf("╚═══════════════════════════════════════════════════════════╝\n\n");

    return 0;
}
