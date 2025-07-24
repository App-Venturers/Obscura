import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function DownloadPDFButton() {
  const generatePDF = async () => {
    const element = document.getElementById("form-preview");
    if (!element) {
      console.warn("No preview element found for PDF export.");
      return; // Optionally trigger toast: addToast("No form preview found.")
    }

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      scrollY: -window.scrollY,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    const pageHeight = pdf.internal.pageSize.getHeight();
    let position = 0;

    if (pdfHeight < pageHeight) {
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    } else {
      while (position < pdfHeight) {
        pdf.addImage(imgData, "PNG", 0, -position, pdfWidth, pdfHeight);
        position += pageHeight;
        if (position < pdfHeight) pdf.addPage();
      }
    }

    pdf.save("Recruitment_Form.pdf");
  };

  return (
    <button
      onClick={generatePDF}
      className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded"
      aria-label="Download form as PDF"
    >
      Download as PDF
    </button>
  );
}
