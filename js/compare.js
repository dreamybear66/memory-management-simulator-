function simulateAlgorithm(algo, requests) {
  resetMemory();
  let result = [];

  requests.forEach(req => {
    algo(req.pid, req.size);
    result.push(calculateStats().externalFrag);
  });

  return result;
}
