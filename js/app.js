function allocate() {
  const size = parseInt(document.getElementById("processSize").value);
  const algo = document.getElementById("algorithm").value;

  let success = false;

  if (algo === "first") success = firstFit(size);
  if (algo === "next") success = nextFit(size);
  if (algo === "best") success = bestFit(size);
  if (algo === "worst") success = worstFit(size);

  if (!success) alert("Allocation Failed!");

  renderMemory();
}

renderMemory();
