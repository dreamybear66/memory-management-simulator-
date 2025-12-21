let fragChart;

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
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

function updateChart(step, value) {
  fragChart.data.labels.push(`Step ${step}`);
  fragChart.data.datasets[0].data.push(value);
  fragChart.update();
}
