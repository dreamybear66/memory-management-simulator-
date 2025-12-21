const TOTAL_MEMORY = 10240;

/*
  Initial memory layout:
  Used and free blocks mixed (for demo)
*/
const INITIAL_MEMORY = [
  { size: 800, free: false, pid: "P1" },
  { size: 300, free: true, pid: null },
  { size: 1200, free: false, pid: "P2" },
  { size: 500, free: true, pid: null },
  { size: 700, free: false, pid: "P3" },
  { size: 400, free: true, pid: null },
  { size: 900, free: false, pid: "P4" },
  { size: 5440, free: true, pid: null }
];

let memory = JSON.parse(JSON.stringify(INITIAL_MEMORY));
let lastIndex = 0;
