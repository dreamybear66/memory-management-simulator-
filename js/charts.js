let fragChart;
let fragData = [];

function initChart() {
  const ctx = document.getElementById("fragChart").getContext("2d");

  fragChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [{
        label: "External Fragmentation (KB)",
        data: [],
        borderWidth: 2
      }]
    }
  });
}

function updateChart(step, value) {
  fragChart.data.labels.push(`Step ${step}`);
  fragChart.data.datasets[0].data.push(value);
  fragChart.update();
}
