const TOTAL_MEMORY = 10240;

/*
 Sample fragmented memory
 (loaded ONLY when user clicks "Load Sample Memory")
*/
const SAMPLE_MEMORY = [
  { size: 800, free: false, pid: "P1" },
  { size: 300, free: true,  pid: null },
  { size: 1200, free: false, pid: "P2" },
  { size: 500, free: true,  pid: null },
  { size: 700, free: false, pid: "P3" },
  { size: 400, free: true,  pid: null },
  { size: 900, free: false, pid: "P4" },
  { size: 5440, free: true,  pid: null }
];


/*
 Default memory → completely free
*/
let memory = [
  { size: TOTAL_MEMORY, free: true, pid: null }
];

let lastIndex = 0;
