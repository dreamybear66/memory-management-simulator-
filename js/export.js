function exportPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const stats = calculateStats();

  doc.setFontSize(16);
  doc.text("Memory Management Simulator Report", 20, 20);

  doc.setFontSize(12);
  doc.text(`Total Memory: ${stats.total} KB`, 20, 40);
  doc.text(`Used Memory: ${stats.used} KB`, 20, 50);
  doc.text(`Free Memory: ${stats.free} KB`, 20, 60);

  doc.text(`Active Processes: ${stats.active}`, 20, 70);
  doc.text(`Largest Free Block: ${stats.largestFree} KB`, 20, 80);
  doc.text(`External Fragmentation: ${stats.externalFrag} KB`, 20, 90);

  doc.save("memory_management_report.pdf");
}
