import jsPDF from 'jspdf'
import 'jspdf-autotable'

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
  }
}

export async function generateCenterReport(center: any, evaluation: any, criteria: any[]) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  
  // Colors (Novo Nordisk Style)
  const primaryColor = [0, 74, 153] // Deep Blue
  const secondaryColor = [100, 116, 139] // Slate
  const greenColor = [16, 185, 129]
  const yellowColor = [245, 158, 11]
  const redColor = [239, 68, 68]

  // Header
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
  doc.rect(0, 0, pageWidth, 40, 'F')
  
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.text('SITE EVALUATION REPORT', 20, 25)
  
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth - 70, 25)

  // Center Info
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text(center.name.toUpperCase(), 20, 55)
  
  doc.setFontSize(10)
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
  doc.text(`Site Code: ${center.code}`, 20, 62)
  doc.text(`Location: ${center.city}, ${center.country}`, 20, 67)

  // Scoring Summary Box
  if (evaluation) {
    const score = evaluation.total_score || 0
    const level = evaluation.score_level || 'pending'
    
    doc.setDrawColor(226, 232, 240)
    doc.setFillColor(248, 250, 252)
    doc.roundedRect(pageWidth - 80, 50, 60, 30, 3, 3, 'FD')
    
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
    doc.setFontSize(8)
    doc.text('FINAL SCORE', pageWidth - 50, 58, { align: 'center' })
    
    doc.setFontSize(24)
    doc.setTextColor(0, 0, 0)
    doc.text(`${score}`, pageWidth - 50, 70, { align: 'center' })
    
    let statusText = level.toUpperCase()
    let statusColor = secondaryColor
    if (level === 'green') statusColor = greenColor
    if (level === 'yellow') statusColor = yellowColor
    if (level === 'red') statusColor = redColor
    
    doc.setFillColor(statusColor[0], statusColor[1], statusColor[2])
    doc.roundedRect(pageWidth - 75, 73, 50, 5, 1, 1, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(7)
    doc.text(statusText, pageWidth - 50, 76.5, { align: 'center' })
  }

  // Contact Info Table
  doc.autoTable({
    startY: 85,
    head: [['Contact Information', 'Details']],
    body: [
      ['Contact Person', center.contact_name || 'N/A'],
      ['Email Address', center.contact_email || 'N/A'],
      ['Phone Number', center.contact_phone || 'N/A'],
      ['Evaluation Date', evaluation ? new Date(evaluation.created_at).toLocaleDateString() : 'N/A'],
      ['Evaluator', evaluation?.evaluator_email || 'N/A']
    ],
    theme: 'striped',
    headStyles: { fillStyle: 'F', fillColor: primaryColor, textColor: 255 },
    styles: { fontSize: 9 }
  })

  // Responses Table
  const responses = evaluation?.responses?.scores || {}
  const tableBody = criteria.map((c, i) => {
    const ans = responses[c.id] || responses[String(c.id)]
    let displayAns = 'N/A'
    if (c.response_type === 'boolean') {
      displayAns = ans === 'yes' ? 'YES' : ans === 'no' ? 'NO' : 'N/A'
    } else {
      displayAns = ans || 'No comment'
    }
    return [i + 1, c.name, displayAns]
  })

  doc.autoTable({
    startY: (doc as any).lastAutoTable.finalY + 15,
    head: [['#', 'Criterion', 'Response']],
    body: tableBody,
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 130 },
      2: { cellWidth: 30, fontStyle: 'bold' }
    },
    headStyles: { fillColor: primaryColor },
    styles: { fontSize: 8, cellPadding: 3 },
    alternateRowStyles: { fillColor: [249, 250, 251] }
  })

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
    doc.text(
      `Confidential - Site Evaluation Report - ${center.name}`,
      20,
      doc.internal.pageSize.getHeight() - 10
    )
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth - 40,
      doc.internal.pageSize.getHeight() - 10
    )
  }

  doc.save(`Report_${center.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`)
}
