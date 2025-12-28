// ============================================================================
// BEST FIT MEMORY ALLOCATION ALGORITHM - C Implementation
// ============================================================================
// Algorithm: Scan entire memory and allocate to the SMALLEST free block
//            that is still large enough for the process.
//
// Time Complexity: O(n) - full scan required to find smallest
// Space Complexity: O(n) - for storing memory blocks
//
// Pros: Minimizes wasted space in allocated blocks
// Cons: Slower than First Fit, requires scanning entire memory
// ============================================================================

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <limits.h>

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
    printf("\n========== MEMORY LAYOUT (BEST FIT) ==========\n");
    printf("%-8s %-15s %-12s %-15s\n", "Block#", "Size (KB)", "Status", "Process ID");
    printf("--------------------------------------------\n");

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
    int totalInternalFragmentation = 0;

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
    int totalFragmentation = totalInternalFragmentation + externalFragmentation;

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
    printf("Total Fragmentation:       %d KB (%.1f%%)\n",
           totalFragmentation, (totalFragmentation * 100.0) / TOTAL_MEMORY);
    printf("================================\n");
}

// ============================================================================
// BEST FIT ALLOCATION ALGORITHM
// ============================================================================

/**
 * BEST FIT: Allocate memory to process
 *
 * Steps:
 * 1. Validate process ID and size
 * 2. Check if process already exists
 * 3. Scan ALL blocks to find best fit
 * 4. Track the SMALLEST block that fits
 * 5. If found, allocate (split if necessary)
 * 6. If not found, return failure
 *
 * Why Best Fit?
 * - Minimizes waste within allocated blocks
 * - Leaves larger blocks available for future allocations
 * - More memory-efficient than First Fit
 *
 * @return: 1 if successful, 0 if failed
 */
int allocateBestFit(char *processId, int requiredSize) {
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

    // BEST FIT: Scan ALL blocks to find the SMALLEST suitable block
    int bestIndex = -1;
    int bestSize = INT_MAX; // Track smallest size found

    for (int i = 0; i < blockCount; i++) {
        // If block is free AND can fit the process
        if (memory[i].isFree && memory[i].size >= requiredSize) {
            // If this block is smaller than previous best, update best
            if (memory[i].size < bestSize) {
                bestSize = memory[i].size;
                bestIndex = i;
            }
        }
    }

    // Check if suitable block was found
    if (bestIndex == -1) {
        printf("✗ [Best Fit] Cannot allocate %d KB to %s (no suitable block found)\n\n",
               requiredSize, processId);
        return 0;
    }

    printf("  [Best Fit] Found best-fit block %d (size %d KB) at position %d\n",
           bestIndex + 1, memory[bestIndex].size, bestIndex);
    printf("  This is the SMALLEST block that can fit the process\n");

    // Allocate to best fit block
    if (memory[bestIndex].size > requiredSize) {
        // Block is larger: SPLIT into allocated + free
        int leftoverSize = memory[bestIndex].size - requiredSize;

        // Shift blocks to make room for new free block
        for (int j = blockCount; j > bestIndex + 1; j--) {
            memory[j] = memory[j - 1];
        }

        // Set allocated block
        memory[bestIndex].size = requiredSize;
        memory[bestIndex].isFree = 0;
        strcpy(memory[bestIndex].processId, processId);

        // Set leftover free block
        memory[bestIndex + 1].size = leftoverSize;
        memory[bestIndex + 1].isFree = 1;
        strcpy(memory[bestIndex + 1].processId, "");

        blockCount++;
    } 
    // Exact fit: no split needed
    else {
        memory[bestIndex].isFree = 0;
        strcpy(memory[bestIndex].processId, processId);
    }

    printf("✓ [Best Fit] Allocated %d KB to %s\n\n", requiredSize, processId);
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
// MAIN - DEMONSTRATION OF BEST FIT
// ============================================================================

int main() {
    printf("\n");
    printf("╔═══════════════════════════════════════════════════════════╗\n");
    printf("║   BEST FIT MEMORY ALLOCATION - C Implementation           ║\n");
    printf("║              Total Memory: 10240 KB                       ║\n");
    printf("╚═══════════════════════════════════════════════════════════╝\n\n");

    initializeMemory();

    // ========== SCENARIO 1: Basic Allocation ==========
    printf("--- SCENARIO 1: Basic Allocation with Best Fit ---\n");
    allocateBestFit("P1", 200);
    allocateBestFit("P2", 150);
    allocateBestFit("P3", 100);
    displayMemoryLayout();
    displayStatistics();

    // ========== SCENARIO 2: Show Best Fit advantage ==========
    printf("\n--- SCENARIO 2: Best Fit vs First Fit Comparison ---\n");
    initializeMemory();
    printf("Allocating with specific sizes to show Best Fit advantage:\n");
    allocateBestFit("Q1", 500);  // [500] [9740]
    allocateBestFit("Q2", 400);  // [500] [400] [9340]
    allocateBestFit("Q3", 300);  // [500] [400] [300] [9040]
    printf("\nNow deallocate Q2 (400 KB free block):\n");
    deallocateMemory("Q2");
    displayMemoryLayout();
    printf("\nTrying to allocate Q4 (350 KB):\n");
    printf("Best Fit chooses the 400 KB block (smallest that fits)\n");
    allocateBestFit("Q4", 350);
    displayMemoryLayout();
    displayStatistics();

    // ========== SCENARIO 3: Deallocation ==========
    printf("\n--- SCENARIO 3: Deallocation Pattern ---\n");
    deallocateMemory("Q1");
    deallocateMemory("Q3");
    coalesceMemory();
    printf("(After deallocating Q1, Q3 and coalescing)\n");
    displayMemoryLayout();
    displayStatistics();

    // ========== SCENARIO 4: Complex fragmentation ==========
    printf("\n--- SCENARIO 4: Complex Memory Scenario ---\n");
    initializeMemory();
    printf("Allocating multiple processes:\n");
    allocateBestFit("R1", 1000);
    allocateBestFit("R2", 800);
    allocateBestFit("R3", 1200);
    allocateBestFit("R4", 600);
    allocateBestFit("R5", 1500);
    displayMemoryLayout();
    displayStatistics();

    printf("\nDeallocating R3 and R2:\n");
    deallocateMemory("R3");
    deallocateMemory("R2");
    coalesceMemory();
    displayMemoryLayout();
    displayStatistics();

    printf("\n╔═══════════════════════════════════════════════════════════╗\n");
    printf("║               Best Fit Simulation Complete                ║\n");
    printf("╚═══════════════════════════════════════════════════════════╝\n\n");

    return 0;
}
