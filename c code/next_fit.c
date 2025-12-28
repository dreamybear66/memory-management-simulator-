// ============================================================================
// NEXT FIT MEMORY ALLOCATION ALGORITHM - C Implementation
// ============================================================================
// Algorithm: Maintains a pointer to the last allocation position.
//            Starts searching from that point instead of from the beginning.
//            Wraps around to the beginning if end is reached.
//
// Time Complexity: O(n) - single pass, but distributed across allocations
// Space Complexity: O(n) - for storing memory blocks
//
// Pros: Better distribution of allocations, faster on average
// Cons: Can still lead to fragmentation, memory is treated as circular
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
int nextFitPointer = 0; // Tracks where to start searching next

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Initialize memory as one large free block
 */
void initializeMemory() {
    blockCount = 0;
    nextFitPointer = 0;
    
    memory[blockCount].size = TOTAL_MEMORY;
    memory[blockCount].isFree = 1;
    strcpy(memory[blockCount].processId, "");
    blockCount++;
    
    printf("✓ Memory initialized: %d KB free\n", TOTAL_MEMORY);
    printf("  Next Fit Pointer: %d\n\n", nextFitPointer);
}

/**
 * Display the entire memory layout
 */
void displayMemoryLayout() {
    printf("\n========== MEMORY LAYOUT (NEXT FIT) ==========\n");
    printf("%-8s %-15s %-12s %-15s %-10s\n", 
           "Block#", "Size (KB)", "Status", "Process ID", "Pointer");
    printf("----------------------------------------------\n");

    for (int i = 0; i < blockCount; i++) {
        char pointer[10] = "";
        if (i == nextFitPointer) {
            strcpy(pointer, "→ NEXT");
        }
        printf("%-8d %-15d %-12s %-15s %-10s\n",
               i + 1,
               memory[i].size,
               memory[i].isFree ? "FREE" : "ALLOCATED",
               memory[i].isFree ? "---" : memory[i].processId,
               pointer);
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
// NEXT FIT ALLOCATION ALGORITHM
// ============================================================================

/**
 * NEXT FIT: Allocate memory to process
 *
 * Steps:
 * 1. Validate process ID and size
 * 2. Check if process already exists
 * 3. Start searching from nextFitPointer
 * 4. Search to end of blocks array
 * 5. If not found, wrap around to beginning
 * 6. Find FIRST free block that fits
 * 7. Update nextFitPointer for next allocation
 * 8. Allocate (split if necessary)
 *
 * Why Next Fit?
 * - Distributes allocations more evenly across memory
 * - Avoids clustering allocations at the beginning
 * - Faster average case (distributes search cost)
 * - Memory treated as circular array
 *
 * @return: 1 if successful, 0 if failed
 */
int allocateNextFit(char *processId, int requiredSize) {
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

    printf("  [Next Fit] Starting search from block %d (pointer position)\n", nextFitPointer + 1);

    int foundIndex = -1;

    // NEXT FIT: Search from nextFitPointer to end of array
    for (int i = nextFitPointer; i < blockCount; i++) {
        if (memory[i].isFree && memory[i].size >= requiredSize) {
            foundIndex = i;
            printf("  [Next Fit] Found free block at position %d (size %d KB)\n", i + 1, memory[i].size);
            break;
        }
    }

    // If not found from nextFitPointer to end, wrap around to beginning
    if (foundIndex == -1) {
        printf("  [Next Fit] Reached end, wrapping around to beginning...\n");
        for (int i = 0; i < nextFitPointer; i++) {
            if (memory[i].isFree && memory[i].size >= requiredSize) {
                foundIndex = i;
                printf("  [Next Fit] Found free block at position %d (size %d KB)\n", i + 1, memory[i].size);
                break;
            }
        }
    }

    // Check if suitable block was found
    if (foundIndex == -1) {
        printf("✗ [Next Fit] Cannot allocate %d KB to %s (no suitable block found)\n\n",
               requiredSize, processId);
        return 0;
    }

    // Allocate to found block
    if (memory[foundIndex].size > requiredSize) {
        // Block is larger: SPLIT into allocated + free
        int leftoverSize = memory[foundIndex].size - requiredSize;

        // Shift blocks to make room for new free block
        for (int j = blockCount; j > foundIndex + 1; j--) {
            memory[j] = memory[j - 1];
        }

        // Set allocated block
        memory[foundIndex].size = requiredSize;
        memory[foundIndex].isFree = 0;
        strcpy(memory[foundIndex].processId, processId);

        // Set leftover free block
        memory[foundIndex + 1].size = leftoverSize;
        memory[foundIndex + 1].isFree = 1;
        strcpy(memory[foundIndex + 1].processId, "");

        blockCount++;
    } 
    // Exact fit: no split needed
    else {
        memory[foundIndex].isFree = 0;
        strcpy(memory[foundIndex].processId, processId);
    }

    // Update pointer for next search
    nextFitPointer = (foundIndex + 1) % blockCount;
    printf("✓ [Next Fit] Allocated %d KB to %s\n", requiredSize, processId);
    printf("  Next Fit Pointer updated to block %d\n\n", nextFitPointer + 1);
    
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
            
            // Adjust pointer if it's beyond new blockCount
            if (nextFitPointer >= blockCount && blockCount > 0) {
                nextFitPointer = nextFitPointer % blockCount;
            }
        } else {
            i++;
        }
    }
}

// ============================================================================
// MAIN - DEMONSTRATION OF NEXT FIT
// ============================================================================

int main() {
    printf("\n");
    printf("╔═══════════════════════════════════════════════════════════╗\n");
    printf("║   NEXT FIT MEMORY ALLOCATION - C Implementation           ║\n");
    printf("║              Total Memory: 10240 KB                       ║\n");
    printf("╚═══════════════════════════════════════════════════════════╝\n\n");

    initializeMemory();

    // ========== SCENARIO 1: Basic Allocation ==========
    printf("--- SCENARIO 1: Basic Allocation with Next Fit ---\n");
    printf("Notice how the pointer moves to next position after each allocation.\n\n");
    allocateNextFit("P1", 200);
    displayMemoryLayout();
    
    allocateNextFit("P2", 150);
    displayMemoryLayout();
    
    allocateNextFit("P3", 100);
    displayMemoryLayout();

    // ========== SCENARIO 2: Distribution advantage ==========
    printf("\n--- SCENARIO 2: Next Fit Distribution Advantage ---\n");
    initializeMemory();
    printf("Allocating with Next Fit shows even distribution:\n\n");
    allocateNextFit("Q1", 1000);
    allocateNextFit("Q2", 1000);
    allocateNextFit("Q3", 1000);
    allocateNextFit("Q4", 1000);
    displayMemoryLayout();
    displayStatistics();

    printf("\nDeallocating Q1, Q3:\n");
    deallocateMemory("Q1");
    deallocateMemory("Q3");
    coalesceMemory();
    displayMemoryLayout();

    // ========== SCENARIO 3: Wrap-around behavior ==========
    printf("\n--- SCENARIO 3: Wrap-Around Behavior ---\n");
    initializeMemory();
    printf("Allocating to demonstrate wrap-around from end to beginning:\n\n");
    allocateNextFit("R1", 2000);
    allocateNextFit("R2", 2000);
    allocateNextFit("R3", 2000);
    allocateNextFit("R4", 2000);
    displayMemoryLayout();

    printf("Now deallocate R2:\n");
    deallocateMemory("R2");
    displayMemoryLayout();

    printf("\nNext allocation will start from R4's position and wrap to beginning:\n");
    allocateNextFit("R5", 1500);
    displayMemoryLayout();
    displayStatistics();

    // ========== SCENARIO 4: Complex scenario ==========
    printf("\n--- SCENARIO 4: Complex Scenario with Multiple Operations ---\n");
    initializeMemory();
    allocateNextFit("S1", 1200);
    allocateNextFit("S2", 800);
    allocateNextFit("S3", 1500);
    allocateNextFit("S4", 600);
    allocateNextFit("S5", 900);
    displayMemoryLayout();
    displayStatistics();

    printf("\nDeallocating S1, S3:\n");
    deallocateMemory("S1");
    deallocateMemory("S3");
    coalesceMemory();
    displayMemoryLayout();

    printf("\nAllocating S6 (2000 KB) - will use coalesced block:\n");
    allocateNextFit("S6", 2000);
    displayMemoryLayout();
    displayStatistics();

    printf("\n╔═══════════════════════════════════════════════════════════╗\n");
    printf("║               Next Fit Simulation Complete                ║\n");
    printf("╚═══════════════════════════════════════════════════════════╝\n\n");

    return 0;
}
