import jsPDF from 'jspdf'
import 'jspdf-autotable'

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF
    lastAutoTable: { finalY: number }
    putTotalPages: (totalPagesExpression: string) => void
  }
}

export async function generateCenterReport(center: any, evaluation: any, criteria: any[]) {
  try {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()

    // Placeholder para total de páginas (jsPDF)
    const totalPagesExp = "{total_pages_count_string}"

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
    doc.text('REPORTE DE EVALUACIÓN DE SITIO', 20, 25)

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Generado: ${new Date().toLocaleDateString('es-ES')}`, pageWidth - 70, 25)

    // Center Info
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text((center?.name || 'NOMBRE DEL SITIO').toUpperCase(), 20, 55)

    doc.setFontSize(10)
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
    doc.text(`Código: ${center?.code || 'N/A'}`, 20, 62)
    doc.text(`Ubicación: ${center?.city || 'N/A'}, ${center?.country || 'N/A'}`, 20, 67)

    // Scoring Summary Box
    if (evaluation && evaluation.total_score !== null && evaluation.total_score !== undefined) {
      const score = Number(evaluation.total_score) || 0

      doc.setDrawColor(226, 232, 240)
      doc.setFillColor(248, 250, 252)
      doc.roundedRect(pageWidth - 80, 50, 60, 30, 3, 3, 'FD')

      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
      doc.setFontSize(8)
      doc.text('PUNTAJE FINAL', pageWidth - 50, 58, { align: 'center' })

      doc.setFontSize(24)
      doc.setTextColor(0, 0, 0)
      doc.text(`${score.toFixed(1)}`, pageWidth - 50, 70, { align: 'center' })

      const statusText = score >= 80 ? 'APROBADO' : score >= 60 ? 'CONDICIONAL' : 'NO APROBADO'
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
        head: [['Información de Contacto', 'Detalles']],
        body: [
          ['Persona de Contacto', center?.contact_name || 'N/A'],
          ['Correo Electrónico', center?.contact_email || 'N/A'],
          ['Teléfono', center?.contact_phone || 'N/A'],
          ['Fecha de Evaluación', evaluation?.created_at ? new Date(evaluation.created_at).toLocaleDateString('es-ES') : 'N/A'],
          ['Evaluador', evaluation?.evaluator_email || 'N/A']
        ],
        theme: 'striped',
        headStyles: { fillColor: primaryColor, textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 4 },
        margin: { left: 20, right: 20 }
      })
    } catch (err) {
      console.error('Error en tabla de contacto:', err)
    }

    // Responses Table
    const rawResponses = evaluation?.responses || {}
    const scores = rawResponses.scores || rawResponses
    const attachments = rawResponses.attachments || {}

    if (criteria && criteria.length > 0) {
      const tableBody = criteria.map((c, i) => {
        const ans = scores[c.id] || scores[String(c.id)]
        let displayAns = 'N/A'

        if (c.response_type === 'boolean') {
          displayAns =
            String(ans).toLowerCase() === 'yes'
              ? 'SÍ'
              : String(ans).toLowerCase() === 'no'
                ? 'NO'
                : 'N/A'
        } else {
          displayAns = ans ? String(ans).substring(0, 50) : 'Sin respuesta'
        }

        const hasDoc = attachments[c.id] || attachments[String(c.id)] ? 'SÍ' : 'NO'
        return [i + 1, c.name || 'Criterio', displayAns, hasDoc]
      })

      try {
        const lastY = (doc as any).lastAutoTable?.finalY || 130

        doc.autoTable({
          startY: lastY + 10,
          head: [['#', 'Parámetro de Evaluación', 'Respuesta', 'Doc']],
          body: tableBody,
          columnStyles: {
            0: { cellWidth: 10 },
            1: { cellWidth: 100 },
            2: { cellWidth: 35, fontStyle: 'bold' },
            3: { cellWidth: 15, halign: 'center' }
          },
          headStyles: { fillColor: primaryColor, textColor: [255, 255, 255], fontStyle: 'bold' },
          styles: { fontSize: 8, cellPadding: 3, overflow: 'linebreak' },
          alternateRowStyles: { fillColor: [249, 250, 251] },
          margin: { left: 20, right: 20 },

          didDrawPage: (data: any) => {
            const pageHeight = doc.internal.pageSize.getHeight()

            doc.setFontSize(8)
            doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])

            doc.text(
              `Confidencial - Reporte de Evaluación de Sitio - ${center?.name || 'Innova Trials'}`,
              20,
              pageHeight - 10
            )

            doc.text(
              `Página ${data.pageNumber} de ${totalPagesExp}`,
              pageWidth - 40,
              pageHeight - 10
            )
          }
        })
      } catch (err) {
        console.error('Error en tabla de respuestas:', err)
      }
    }

    // Completar total pages al final
    if ((doc as any).putTotalPages) {
      (doc as any).putTotalPages(totalPagesExp)
    }

    // Save PDF
    const fileName = `Reporte_${(center?.name || 'Sitio').replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(fileName)

    return { success: true, fileName }
  } catch (error) {
    console.error('Error generando PDF:', error)
    throw new Error(`Error al generar el reporte PDF: ${error instanceof Error ? error.message : 'Error desconocido'}`)
  }
}
