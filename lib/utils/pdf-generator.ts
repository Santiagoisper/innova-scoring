import jsPDF from 'jspdf'
import 'jspdf-autotable'

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
    lastAutoTable: { finalY: number }
  }
}

export async function generateCenterReport(center: any, evaluation: any, criteria: any[], evalItems?: any[]) {
  try {
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
    doc.text(`Generated: ${new Date().toLocaleDateString('en-US')}`, pageWidth - 70, 25)

    // Center Info
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text((center?.name || 'SITE NAME').toUpperCase(), 20, 55)

    doc.setFontSize(10)
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
    doc.text(`Code: ${center?.code || 'N/A'}`, 20, 62)
    doc.text(`Location: ${center?.city || 'N/A'}, ${center?.country || 'N/A'}`, 20, 67)

    // Scoring Summary Box
    if (evaluation && evaluation.total_score !== null && evaluation.total_score !== undefined) {
      const score = Number(evaluation.total_score) || 0

      doc.setDrawColor(226, 232, 240)
      doc.setFillColor(248, 250, 252)
      doc.roundedRect(pageWidth - 80, 50, 60, 30, 3, 3, 'FD')

      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
      doc.setFontSize(8)
      doc.text('FINAL SCORE', pageWidth - 50, 58, { align: 'center' })

      doc.setFontSize(24)
      doc.setTextColor(0, 0, 0)
      doc.text(`${score.toFixed(1)}`, pageWidth - 50, 70, { align: 'center' })

      const statusText = score >= 80 ? 'APPROVED' : score >= 60 ? 'CONDITIONAL' : 'NOT APPROVED'
      const statusColor = score >= 80 ? greenColor : score >= 60 ? yellowColor : redColor

      doc.setFillColor(statusColor[0], statusColor[1], statusColor[2])
      doc.roundedRect(pageWidth - 75, 73, 50, 5, 1, 1, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(7)
      doc.text(statusText, pageWidth - 50, 76.5, { align: 'center' })
    }

    // Contact Info Table
    try {
      doc.autoTable({
        startY: 85,
        head: [['Contact Information', 'Details']],
        body: [
          ['Contact Person', center?.contact_name || 'N/A'],
          ['Email', center?.contact_email || 'N/A'],
          ['Phone', center?.contact_phone || 'N/A'],
          ['Evaluation Date', evaluation?.created_at ? new Date(evaluation.created_at).toLocaleDateString('en-US') : 'N/A'],
          ['Evaluator', evaluation?.evaluator_email || 'N/A']
        ],
        theme: 'striped',
        headStyles: { fillColor: primaryColor, textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 4 },
        margin: { left: 20, right: 20 }
      })
    } catch (err) {
      console.error('Error in contact table:', err)
    }

    // Build merged responses from both evaluation.responses and evaluation_items
    const rawResponses = evaluation?.responses || {}
    const respScores = rawResponses.scores || rawResponses
    const attachments = rawResponses.attachments || {}

    // Build a map: criterion_id -> answer (from eval_items first, then responses JSON)
    const mergedAnswers: Record<string, any> = {}

    // From evaluation_items (admin evaluations)
    if (evalItems && evalItems.length > 0) {
      for (const item of evalItems) {
        const cid = item.criterion_id || item.criteria_id
        if (cid && typeof item.score === 'number') {
          mergedAnswers[cid] = item.score
        }
      }
    }

    // From responses JSON (client evaluations) - only fill if not already set
    if (respScores && typeof respScores === 'object') {
      for (const [key, value] of Object.entries(respScores)) {
        if (!(key in mergedAnswers)) {
          mergedAnswers[key] = value
        }
      }
    }

    if (criteria && criteria.length > 0) {
      const tableBody = criteria.map((c: any, i: number) => {
        const ans = mergedAnswers[c.id] || mergedAnswers[String(c.id)]
        let displayAns = 'Pending'

        if (typeof ans === 'number') {
          // Numeric score from admin evaluation
          displayAns = `${ans} / 100`
        } else if (c.response_type === 'boolean') {
          displayAns = String(ans).toLowerCase() === 'yes' ? 'YES' : String(ans).toLowerCase() === 'no' ? 'NO' : 'Pending'
        } else if (ans) {
          displayAns = String(ans).substring(0, 50)
        }

        const hasDoc = attachments[c.id] || attachments[String(c.id)] ? 'YES' : 'NO'
        return [i + 1, c.name || 'Criterion', displayAns, c.weight || 0, hasDoc]
      })

      try {
        const lastY = (doc as any).lastAutoTable?.finalY || 130
        doc.autoTable({
          startY: lastY + 10,
          head: [['#', 'Evaluation Parameter', 'Response', 'Weight', 'Doc']],
          body: tableBody,
          columnStyles: {
            0: { cellWidth: 10 },
            1: { cellWidth: 80 },
            2: { cellWidth: 35, fontStyle: 'bold' },
            3: { cellWidth: 15, halign: 'center' },
            4: { cellWidth: 15, halign: 'center' }
          },
          headStyles: { fillColor: primaryColor, textColor: [255, 255, 255], fontStyle: 'bold' },
          styles: { fontSize: 8, cellPadding: 3, overflow: 'linebreak' },
          alternateRowStyles: { fillColor: [249, 250, 251] },
          margin: { left: 20, right: 20 },
          didDrawPage: () => {
            // Footer on each page
            const pageCount = doc.getNumberOfPages()
            const pageSize = doc.internal.pageSize
            const ph = pageSize.getHeight()

            for (let i = 1; i <= pageCount; i++) {
              doc.setPage(i)
              doc.setFontSize(8)
              doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
              doc.text(
                `Confidential - Site Evaluation Report - ${center?.name || 'Innova Trials'}`,
                20,
                ph - 10
              )
              doc.text(
                `Page ${i} of ${pageCount}`,
                pageWidth - 40,
                ph - 10
              )
            }
          }
        })
      } catch (err) {
        console.error('Error in responses table:', err)
      }
    }

    // Save PDF
    const fileName = `Report_${(center?.name || 'Site').replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(fileName)

    return { success: true, fileName }
  } catch (error) {
    console.error('Error generating PDF:', error)
    throw new Error(`Error generating PDF report: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
