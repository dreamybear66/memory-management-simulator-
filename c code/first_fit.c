// ============================================================================
// FIRST FIT MEMORY ALLOCATION ALGORITHM - C Implementation
// ============================================================================
// Algorithm: Scan memory from beginning and allocate to the FIRST free block
//            that is large enough to accommodate the process.
//
// Time Complexity: O(n) - single pass through memory blocks
// Space Complexity: O(n) - for storing memory blocks
//
// Pros: Simple and fast, minimal overhead
// Cons: Can lead to external fragmentation
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
    printf("\n========== MEMORY LAYOUT (FIRST FIT) ==========\n");
    printf("%-8s %-15s %-12s %-15s\n", "Block#", "Size (KB)", "Status", "Process ID");
    printf("---------------------------------------------\n");

    for (int i = 0; i < blockCount; i++) {
        printf("%-8d %-15d %-12s %-15s\n",
               i + 1,
               memory[i].size,
               memory[i].isFree ? "FREE" : "ALLOCATED",
               memory[i].isFree ? "---" : memory[i].processId);
    }
    printf("============================================\n");
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
// FIRST FIT ALLOCATION ALGORITHM
// ============================================================================

/**
 * FIRST FIT: Allocate memory to process
 *
 * Steps:
 * 1. Validate process ID and size
 * 2. Check if process already exists
 * 3. Scan blocks from beginning
 * 4. Find FIRST free block that fits
 * 5. If found, allocate (split if necessary)
 * 6. If not found, return failure
 *
 * @return: 1 if successful, 0 if failed
 */
int allocateFirstFit(char *processId, int requiredSize) {
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

    // FIRST FIT: Scan from beginning, allocate to FIRST suitable block
    for (int i = 0; i < blockCount; i++) {
        // If block is free AND large enough, allocate here
        if (memory[i].isFree && memory[i].size >= requiredSize) {
            printf("  [First Fit] Found free block %d (size %d KB) at position %d\n",
                   i + 1, memory[i].size, i);

            // Case 1: Block is larger than required size
            // Split block: create allocated block + leftover free block
            if (memory[i].size > requiredSize) {
                int leftoverSize = memory[i].size - requiredSize;

                // Create new free block for leftover space
                for (int j = blockCount; j > i + 1; j--) {
                    memory[j] = memory[j - 1];
                }

                // Set allocated block
                memory[i].size = requiredSize;
                memory[i].isFree = 0;
                strcpy(memory[i].processId, processId);

                // Set leftover free block
                memory[i + 1].size = leftoverSize;
                memory[i + 1].isFree = 1;
                strcpy(memory[i + 1].processId, "");

                blockCount++;
            } 
            // Case 2: Exact fit - no split needed
            else {
                memory[i].isFree = 0;
                strcpy(memory[i].processId, processId);
            }

            printf("✓ [First Fit] Allocated %d KB to %s\n\n", requiredSize, processId);
            return 1;
        }
    }

    // No suitable block found
    printf("✗ [First Fit] Cannot allocate %d KB to %s (not enough contiguous memory)\n\n",
           requiredSize, processId);
    return 0;
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
            // Merge blocks
            memory[i].size += memory[i + 1].size;

            // Remove next block
            for (int j = i + 1; j < blockCount - 1; j++) {
                memory[j] = memory[j + 1];
            }
            blockCount--;
            // Don't increment i, check if merge can continue
        } else {
            i++;
        }
    }
}

// ============================================================================
// MAIN - DEMONSTRATION OF FIRST FIT
// ============================================================================

int main() {
    printf("\n");
    printf("╔═══════════════════════════════════════════════════════════╗\n");
    printf("║   FIRST FIT MEMORY ALLOCATION - C Implementation          ║\n");
    printf("║              Total Memory: 10240 KB                       ║\n");
    printf("╚═══════════════════════════════════════════════════════════╝\n\n");

    initializeMemory();

    // ========== SCENARIO 1: Basic Allocation ==========
    printf("--- SCENARIO 1: Basic Allocation with First Fit ---\n");
    allocateFirstFit("P1", 200);
    allocateFirstFit("P2", 150);
    allocateFirstFit("P3", 100);
    displayMemoryLayout();
    displayStatistics();

    // ========== SCENARIO 2: Deallocation ==========
    printf("\n--- SCENARIO 2: Deallocation ---\n");
    deallocateMemory("P2");
    coalesceMemory();
    printf("(After deallocating P2 and coalescing)\n");
    displayMemoryLayout();
    displayStatistics();

    // ========== SCENARIO 3: Allocation in freed space ==========
    printf("\n--- SCENARIO 3: Allocating in Previously Free Space ---\n");
    allocateFirstFit("P4", 100);
    displayMemoryLayout();
    displayStatistics();

    // ========== SCENARIO 4: Fragmentation demonstration ==========
    printf("\n--- SCENARIO 4: Demonstrating External Fragmentation ---\n");
    initializeMemory();
    printf("Allocating multiple small processes:\n");
    allocateFirstFit("P5", 1000);
    allocateFirstFit("P6", 1000);
    allocateFirstFit("P7", 1000);
    allocateFirstFit("P8", 1000);
    allocateFirstFit("P9", 1000);
    allocateFirstFit("P10", 1000);
    allocateFirstFit("P11", 1000);
    allocateFirstFit("P12", 1000);
    allocateFirstFit("P13", 1000);
    allocateFirstFit("P14", 1000);
    displayMemoryLayout();
    displayStatistics();

    printf("Now all memory is allocated. Try allocating P15:\n");
    allocateFirstFit("P15", 500);

    // ========== SCENARIO 5: Deallocation pattern ==========
    printf("\n--- SCENARIO 5: Deallocation with Gaps ---\n");
    deallocateMemory("P6");
    deallocateMemory("P8");
    deallocateMemory("P10");
    deallocateMemory("P12");
    coalesceMemory();
    printf("(Deallocated P6, P8, P10, P12 and coalesced)\n");
    displayMemoryLayout();
    displayStatistics();

    printf("Now trying to allocate P15 again (First Fit finds first suitable block):\n");
    allocateFirstFit("P15", 500);
    displayMemoryLayout();
    displayStatistics();

    printf("\n╔═══════════════════════════════════════════════════════════╗\n");
    printf("║               First Fit Simulation Complete                ║\n");
    printf("╚═══════════════════════════════════════════════════════════╝\n\n");

    return 0;
}
