function exportPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const stats = calculateStats();

  doc.text("Memory Management Report", 20, 20);
  doc.text(`Total Memory: ${stats.total}`, 20, 40);
  doc.text(`Used Memory: ${stats.used}`, 20, 50);
  doc.text(`Free Memory: ${stats.free}`, 20, 60);
  doc.text(`External Fragmentation: ${stats.externalFrag}`, 20, 70);
  doc.text(`Internal Fragmentation: ${stats.internalFrag}`, 20, 80);

  doc.save("memory_report.pdf");
}
