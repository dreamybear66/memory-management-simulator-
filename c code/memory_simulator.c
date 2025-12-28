#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <limits.h>

// ============================================================================
// MEMORY MANAGEMENT SIMULATOR - Pure C Implementation
// ============================================================================
// Core OS Concepts Demonstrated:
// - Contiguous Memory Allocation
// - Memory Fragmentation (External)
// - Linked List Data Structure for Memory Blocks
// - Allocation Algorithms: First Fit, Best Fit
// - Memory Coalescing (Block Merging)
// ============================================================================

#define TOTAL_MEMORY 1024  // Total memory in KB
#define MAX_PROCESS_ID 10  // Max characters in process ID

// ============================================================================
// MEMORY BLOCK STRUCTURE
// ============================================================================
// Represents a contiguous block of memory
// Each block can be either allocated (to a process) or free
typedef struct MemoryBlock {
    int size;                          // Size of block in KB
    int isFree;                        // 1 = free, 0 = allocated
    char processId[MAX_PROCESS_ID];   // Process ID (empty if free)
    struct MemoryBlock *next;          // Pointer to next block (linked list)
} MemoryBlock;

// Global pointer to head of memory linked list
MemoryBlock *memoryHead = NULL;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Initialize memory as one large free block
 * This is called at the start to set up the entire memory as available
 */
void initializeMemory() {
    // Free any existing memory
    MemoryBlock *current = memoryHead;
    while (current != NULL) {
        MemoryBlock *temp = current;
        current = current->next;
        free(temp);
    }

    // Create initial block: entire memory is free
    memoryHead = (MemoryBlock *)malloc(sizeof(MemoryBlock));
    memoryHead->size = TOTAL_MEMORY;
    memoryHead->isFree = 1;
    strcpy(memoryHead->processId, "");
    memoryHead->next = NULL;

    printf("✓ Memory initialized: %d KB free\n\n", TOTAL_MEMORY);
}

/**
 * Display the entire memory layout
 * Shows each block with its size, status (FREE/allocated), and process ID
 */
void displayMemoryLayout() {
    printf("\n========== MEMORY LAYOUT ==========\n");
    printf("%-8s %-15s %-12s %-15s\n", "Block#", "Size (KB)", "Status", "Process ID");
    printf("-------------------------------------\n");

    int blockNum = 1;
    MemoryBlock *current = memoryHead;

    while (current != NULL) {
        printf("%-8d %-15d %-12s %-15s\n",
               blockNum,
               current->size,
               current->isFree ? "FREE" : "ALLOCATED",
               current->isFree ? "---" : current->processId);
        current = current->next;
        blockNum++;
    }
    printf("==================================\n");
}

/**
 * Calculate and display memory statistics
 * Includes: used memory, free memory, processes, fragmentation
 */
void displayStatistics() {
    int usedMemory = 0;
    int freeMemory = 0;
    int activeProcesses = 0;
    int largestFreeBlock = 0;

    MemoryBlock *current = memoryHead;

    // Count statistics
    while (current != NULL) {
        if (current->isFree) {
            freeMemory += current->size;
            if (current->size > largestFreeBlock) {
                largestFreeBlock = current->size;
            }
        } else {
            usedMemory += current->size;
            activeProcesses++;
        }
        current = current->next;
    }

    // External Fragmentation = Total Free Memory - Largest Free Block
    // This represents memory that is free but fragmented into multiple blocks
    // and cannot be used for larger allocations
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
// ALLOCATION ALGORITHMS
// ============================================================================

/**
 * FIRST FIT ALLOCATION ALGORITHM
 * 
 * Strategy: Scan memory from beginning and allocate to the FIRST free block
 * that is large enough to accommodate the process.
 * 
 * Pros: Fast, simple
 * Cons: May leave small fragments and cause fragmentation
 * 
 * @param processId: ID of process to allocate
 * @param requiredSize: Memory size needed in KB
 * @return: 1 if successful, 0 if failed
 */
int allocateFirstFit(char *processId, int requiredSize) {
    // Validation
    if (requiredSize <= 0 || requiredSize > TOTAL_MEMORY) {
        printf("✗ Invalid size: %d KB\n", requiredSize);
        return 0;
    }

    // Check if process already exists
    MemoryBlock *current = memoryHead;
    while (current != NULL) {
        if (!current->isFree && strcmp(current->processId, processId) == 0) {
            printf("✗ Process %s already allocated\n", processId);
            return 0;
        }
        current = current->next;
    }

    // First Fit: Find first free block that fits
    current = memoryHead;
    while (current != NULL) {
        if (current->isFree && current->size >= requiredSize) {
            // Found suitable block
            if (current->size > requiredSize) {
                // Block is larger than needed: SPLIT the block
                // Create new block for remaining free space
                MemoryBlock *newBlock = (MemoryBlock *)malloc(sizeof(MemoryBlock));
                newBlock->size = current->size - requiredSize;
                newBlock->isFree = 1;
                strcpy(newBlock->processId, "");
                newBlock->next = current->next;

                // Update current block (now allocated)
                current->size = requiredSize;
                current->isFree = 0;
                strcpy(current->processId, processId);
                current->next = newBlock;
            } else {
                // Exact fit: just allocate
                current->isFree = 0;
                strcpy(current->processId, processId);
            }

            printf("✓ [First Fit] Allocated %d KB to %s\n", requiredSize, processId);
            return 1;
        }
        current = current->next;
    }

    // No suitable block found
    printf("✗ [First Fit] Cannot allocate %d KB to %s (not enough contiguous memory)\n",
           requiredSize, processId);
    return 0;
}

/**
 * BEST FIT ALLOCATION ALGORITHM
 * 
 * Strategy: Scan entire memory and allocate to the block with the SMALLEST size
 * that is still large enough for the process.
 * 
 * Pros: Minimizes wasted space in allocated blocks
 * Cons: Slower (scans entire memory), may still cause fragmentation
 * 
 * @param processId: ID of process to allocate
 * @param requiredSize: Memory size needed in KB
 * @return: 1 if successful, 0 if failed
 */
int allocateBestFit(char *processId, int requiredSize) {
    // Validation
    if (requiredSize <= 0 || requiredSize > TOTAL_MEMORY) {
        printf("✗ Invalid size: %d KB\n", requiredSize);
        return 0;
    }

    // Check if process already exists
    MemoryBlock *current = memoryHead;
    while (current != NULL) {
        if (!current->isFree && strcmp(current->processId, processId) == 0) {
            printf("✗ Process %s already allocated\n", processId);
            return 0;
        }
        current = current->next;
    }

    // Best Fit: Find the smallest free block that fits
    MemoryBlock *bestBlock = NULL;
    int bestSize = INT_MAX;

    current = memoryHead;
    while (current != NULL) {
        if (current->isFree && current->size >= requiredSize && current->size < bestSize) {
            bestBlock = current;
            bestSize = current->size;
        }
        current = current->next;
    }

    if (bestBlock == NULL) {
        printf("✗ [Best Fit] Cannot allocate %d KB to %s (not enough contiguous memory)\n",
               requiredSize, processId);
        return 0;
    }

    // Allocate to best fit block
    if (bestBlock->size > requiredSize) {
        // Block is larger: SPLIT
        MemoryBlock *newBlock = (MemoryBlock *)malloc(sizeof(MemoryBlock));
        newBlock->size = bestBlock->size - requiredSize;
        newBlock->isFree = 1;
        strcpy(newBlock->processId, "");
        newBlock->next = bestBlock->next;

        bestBlock->size = requiredSize;
        bestBlock->isFree = 0;
        strcpy(bestBlock->processId, processId);
        bestBlock->next = newBlock;
    } else {
        // Exact fit
        bestBlock->isFree = 0;
        strcpy(bestBlock->processId, processId);
    }

    printf("✓ [Best Fit] Allocated %d KB to %s\n", requiredSize, processId);
    return 1;
}

// ============================================================================
// DEALLOCATION AND MEMORY COALESCING
// ============================================================================

/**
 * DEALLOCATE MEMORY
 * Finds the process by ID and marks its block as free
 * 
 * @param processId: ID of process to deallocate
 * @return: 1 if successful, 0 if process not found
 */
int deallocateMemory(char *processId) {
    MemoryBlock *current = memoryHead;

    while (current != NULL) {
        if (!current->isFree && strcmp(current->processId, processId) == 0) {
            // Found the process: free it
            current->isFree = 1;
            strcpy(current->processId, "");
            printf("✓ Deallocated process %s\n", processId);
            return 1;
        }
        current = current->next;
    }

    printf("✗ Process %s not found\n", processId);
    return 0;
}

/**
 * MEMORY COALESCING (Block Merging)
 * 
 * After deallocation, adjacent free blocks are merged into a single larger block.
 * This reduces external fragmentation.
 * 
 * OS Concept: Coalescing reduces fragmentation but requires list traversal.
 */
void coalesceMemory() {
    MemoryBlock *current = memoryHead;

    while (current != NULL && current->next != NULL) {
        // If current block and next block are both free, merge them
        if (current->isFree && current->next->isFree) {
            // Merge: add next block's size to current block
            current->size += current->next->size;

            // Remove next block from list
            MemoryBlock *temp = current->next;
            current->next = current->next->next;
            free(temp);

            // Don't move to next; check if we can merge again
            // (current might now be mergeable with the new next block)
        } else {
            current = current->next;
        }
    }
}

// ============================================================================
// MEMORY COMPACTION
// ============================================================================

/**
 * MEMORY COMPACTION
 * 
 * Moves all allocated blocks to the beginning of memory and consolidates
 * all free space into one block at the end.
 * 
 * This eliminates external fragmentation completely, but is expensive because:
 * 1. Must traverse entire memory
 * 2. Must update pointers (in real OS, requires updating all memory addresses)
 * 3. Takes CPU time proportional to memory size
 * 
 * Note: In real systems, this is done rarely because of high cost.
 */
void compactMemory() {
    if (memoryHead == NULL) return;

    // Step 1: Separate allocated and free blocks
    MemoryBlock *allocated = NULL;
    MemoryBlock *allocatedTail = NULL;
    int totalFree = 0;

    MemoryBlock *current = memoryHead;
    while (current != NULL) {
        if (!current->isFree) {
            // This is an allocated block, add to allocated list
            MemoryBlock *newBlock = (MemoryBlock *)malloc(sizeof(MemoryBlock));
            newBlock->size = current->size;
            newBlock->isFree = 0;
            strcpy(newBlock->processId, current->processId);
            newBlock->next = NULL;

            if (allocated == NULL) {
                allocated = newBlock;
                allocatedTail = newBlock;
            } else {
                allocatedTail->next = newBlock;
                allocatedTail = newBlock;
            }
        } else {
            // This is a free block, accumulate total free memory
            totalFree += current->size;
        }
        current = current->next;
    }

    // Step 2: Free old memory list
    current = memoryHead;
    while (current != NULL) {
        MemoryBlock *temp = current;
        current = current->next;
        free(temp);
    }

    // Step 3: Rebuild list: allocated blocks + one large free block at end
    memoryHead = allocated;

    if (allocated != NULL) {
        allocatedTail->next = NULL;
        if (totalFree > 0) {
            MemoryBlock *freeBlock = (MemoryBlock *)malloc(sizeof(MemoryBlock));
            freeBlock->size = totalFree;
            freeBlock->isFree = 1;
            strcpy(freeBlock->processId, "");
            freeBlock->next = NULL;
            allocatedTail->next = freeBlock;
        }
    } else {
        // All memory is free
        memoryHead = (MemoryBlock *)malloc(sizeof(MemoryBlock));
        memoryHead->size = TOTAL_MEMORY;
        memoryHead->isFree = 1;
        strcpy(memoryHead->processId, "");
        memoryHead->next = NULL;
    }

    printf("✓ Memory compaction complete\n");
}

// ============================================================================
// MAIN FUNCTION - DEMONSTRATION
// ============================================================================

int main() {
    printf("\n");
    printf("╔════════════════════════════════════════════════════════╗\n");
    printf("║   MEMORY MANAGEMENT SIMULATOR - Pure C Implementation  ║\n");
    printf("║              Total Memory: 1024 KB                     ║\n");
    printf("╚════════════════════════════════════════════════════════╝\n");

    // Initialize memory
    initializeMemory();

    // ========== SCENARIO 1: First Fit Allocation ==========
    printf("\n--- SCENARIO 1: First Fit Allocation ---\n");
    allocateFirstFit("P1", 150);
    allocateFirstFit("P2", 200);
    allocateFirstFit("P3", 100);
    displayMemoryLayout();
    displayStatistics();

    // ========== SCENARIO 2: Deallocation and Coalescing ==========
    printf("\n--- SCENARIO 2: Deallocation and Coalescing ---\n");
    deallocateMemory("P1");
    coalesceMemory();
    printf("(Adjacent free blocks merged)\n");
    displayMemoryLayout();
    displayStatistics();

    // ========== SCENARIO 3: Reset and Best Fit Comparison ==========
    printf("\n--- SCENARIO 3: Best Fit Allocation (Fresh Memory) ---\n");
    initializeMemory();
    allocateBestFit("P4", 150);
    allocateBestFit("P5", 200);
    allocateBestFit("P6", 100);
    displayMemoryLayout();
    displayStatistics();

    // ========== SCENARIO 4: Show fragmentation ==========
    printf("\n--- SCENARIO 4: Demonstrating External Fragmentation ---\n");
    deallocateMemory("P5");
    coalesceMemory();
    printf("(After deallocating P5)\n");
    displayMemoryLayout();
    displayStatistics();

    printf("\nNotice: External Fragmentation exists even though\n");
    printf("        total free memory might seem sufficient.\n");
    printf("        This is because free memory is split into multiple blocks.\n");

    // ========== SCENARIO 5: Memory Compaction ==========
    printf("\n--- SCENARIO 5: Memory Compaction ---\n");
    compactMemory();
    printf("(All allocated blocks moved to front, free space consolidated at end)\n");
    displayMemoryLayout();
    displayStatistics();

    printf("\nNote: External Fragmentation is now ZERO because all\n");
    printf("      free memory is in a single contiguous block.\n");

    // ========== SCENARIO 6: Demonstrating Allocation Failure ==========
    printf("\n--- SCENARIO 6: Allocation Failure ---\n");
    initializeMemory();
    printf("Trying to allocate 2000 KB (larger than total memory)...\n");
    allocateFirstFit("P_HUGE", 2000);

    printf("\nTrying to allocate 1025 KB (larger than total memory)...\n");
    allocateFirstFit("P_LARGE", 1025);

    printf("\nTrying to allocate 100 KB (with sufficient total free memory)...\n");
    allocateFirstFit("P7", 400);
    allocateFirstFit("P8", 300);
    allocateFirstFit("P9", 300);
    deallocateMemory("P8");
    printf("Now trying to allocate 350 KB (fragmentation prevents it)...\n");
    allocateFirstFit("P10", 350);
    displayMemoryLayout();
    displayStatistics();

    printf("\nCompacting memory...\n");
    compactMemory();
    printf("Now the same 350 KB allocation succeeds:\n");
    allocateFirstFit("P10", 350);
    displayMemoryLayout();
    displayStatistics();

    printf("\n╔════════════════════════════════════════════════════════╗\n");
    printf("║                    Simulation Complete                 ║\n");
    printf("╚════════════════════════════════════════════════════════╝\n\n");

    return 0;
}
