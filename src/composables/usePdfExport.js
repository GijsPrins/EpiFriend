import { jsPDF } from 'jspdf'
import { autoTable } from 'jspdf-autotable'
import { useI18n } from 'vue-i18n'
import { useEpisodeStore } from './useEpisodeStore'
import { useMedicationStore } from './useMedicationStore'
import { useSettings } from './useSettings'

export function usePdfExport() {
  const { t, locale } = useI18n()
  const { episodes } = useEpisodeStore()
  const { medications, medicationLogs } = useMedicationStore()
  const { settings } = useSettings()

  /**
   * Generate a medical PDF report
   * @param {Object} options - Export options
   * @param {boolean} options.includeEpisodes - Include episodes in the report
   * @param {boolean} options.includeMissedMeds - Include missed medications
   * @param {string} options.episodeDetailLevel - 'basic' or 'full'
   * @param {boolean} options.includePatientInfo - Include full patient information
   * @param {Object} options.dateRange - Optional date range {from, to}
   */
  const generateMedicalPDF = (options = {}) => {
    const {
      includeEpisodes = true,
      includeMissedMeds = true,
      episodeDetailLevel = 'full',
      includePatientInfo = true,
      dateRange = null
    } = options

    // Create new PDF document
    const doc = new jsPDF()
    let yPosition = 20

    // Header
    doc.setFontSize(20)
    doc.setTextColor(30, 58, 138) // Primary blue color
    doc.text(t('pdf.report.title'), 105, yPosition, { align: 'center' })
    
    yPosition += 10
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    const generatedDate = new Date().toLocaleString(locale.value)
    doc.text(t('pdf.report.generated', { date: generatedDate }), 105, yPosition, { align: 'center' })
    
    yPosition += 15

    // Patient Information Section
    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)
    doc.text(t('pdf.patient_info'), 14, yPosition)
    yPosition += 7

    // Always show patient name and DOB
    doc.setFontSize(10)
    const patientName = settings.value.profile.name || t('pdf.report.not_provided')
    doc.text(t('pdf.report.patient_name', { name: patientName }), 14, yPosition)
    yPosition += 6

    if (settings.value.profile.dateOfBirth) {
      const dob = new Date(settings.value.profile.dateOfBirth).toLocaleDateString(locale.value)
      doc.text(t('pdf.report.date_of_birth', { dob }), 14, yPosition)
      yPosition += 6
    }

    // Additional patient info (optional)
    if (includePatientInfo) {

      if (settings.value.medical.allergies && settings.value.medical.allergies.length > 0) {
        doc.text(t('pdf.report.allergies', { allergies: settings.value.medical.allergies.join(', ') }), 14, yPosition)
        yPosition += 6
      }

      if (settings.value.emergency.doctorName) {
        doc.text(t('pdf.report.doctor', { doctorName: settings.value.emergency.doctorName }), 14, yPosition)
        yPosition += 6
      }

      if (settings.value.emergency.neurologistName) {
        doc.text(t('pdf.report.neurologist', { neurologistName: settings.value.emergency.neurologistName }), 14, yPosition)
        yPosition += 6
      }

      if (settings.value.medical.notes) {
        doc.text(t('pdf.report.medical_notes'), 14, yPosition)
        yPosition += 5
        const splitNotes = doc.splitTextToSize(settings.value.medical.notes, 180)
        doc.setFontSize(9)
        doc.text(splitNotes, 14, yPosition)
        yPosition += splitNotes.length * 4 + 5
        doc.setFontSize(10)
      }
    }

    yPosition += 10

    // Filter data by date range if provided
    const filterByDateRange = (items, timestampField = 'timestamp') => {
      if (!dateRange || (!dateRange.from && !dateRange.to)) return items
      
      return items.filter(item => {
        const itemDate = new Date(item[timestampField])
        if (dateRange.from && itemDate < new Date(dateRange.from)) return false
        if (dateRange.to && itemDate > new Date(dateRange.to)) return false
        return true
      })
    }

    // Episodes Section
    if (includeEpisodes) {
      const filteredEpisodes = filterByDateRange(episodes.value)
      
      if (filteredEpisodes.length > 0) {
        // Check if we need a new page
        if (yPosition > 250) {
          doc.addPage()
          yPosition = 20
        }

        doc.setFontSize(14)
        doc.setTextColor(0, 0, 0)
        doc.text(t('pdf.report.episodes'), 14, yPosition)
        yPosition += 7

        // Prepare table data
        const episodeData = filteredEpisodes.map(ep => {
          const date = new Date(ep.timestamp).toLocaleDateString(locale.value)
          const time = new Date(ep.timestamp).toLocaleTimeString(locale.value, { 
            hour: '2-digit', 
            minute: '2-digit' 
          })
          const type = t(`common.episode_types.${ep.type || 'general'}`)

          if (episodeDetailLevel === 'basic') {
            return [date, time, type]
          } else {
            // Full details
            const severity = ep.severity || '-'
            const duration = ep.duration || '-'
            
            // Combine symptoms
            const symptoms = []
            if (ep.warningSymptoms) symptoms.push(...ep.warningSymptoms)
            if (ep.duringSymptoms) symptoms.push(...ep.duringSymptoms)
            if (ep.afterSymptoms) symptoms.push(...ep.afterSymptoms)
            const symptomStr = symptoms.length > 0 ? symptoms.map(s => t(`common.${s}`)).join(', ') : '-'
            
            const triggers = ep.triggers && ep.triggers.length > 0 ? ep.triggers.map(tr => t(`common.${tr}`)).join(', ') : '-'
            
            // Emergency response
            const emergency = []
            if (ep.someoneWitnessed) emergency.push(t('pdf.report.someone_witnessed'))
            if (ep.emergencyCalled) emergency.push(t('pdf.report.emergency_called'))
            if (ep.wentToHospital) emergency.push(t('pdf.report.went_to_hospital'))
            const emergencyStr = emergency.length > 0 ? emergency.join(', ') : '-'
            
            const notes = ep.notes || '-'

            return [date, time, type, severity, duration, triggers, symptomStr, emergencyStr, notes]
          }
        })

        // Table headers
        const episodeHeaders = episodeDetailLevel === 'basic'
          ? [t('pdf.report.date'), t('pdf.report.time'), t('pdf.report.type')]
          : [t('pdf.report.date'), t('pdf.report.time'), t('pdf.report.type'), t('pdf.report.severity'), t('pdf.report.duration'), t('pdf.report.triggers'), t('pdf.report.symptoms'), t('pdf.report.emergency'), t('pdf.report.notes')]

        autoTable(doc, {
          startY: yPosition,
          head: [episodeHeaders],
          body: episodeData,
          theme: 'grid',
          headStyles: { fillColor: [30, 58, 138], textColor: 255 },
          styles: { fontSize: 8, cellPadding: 2 },
          columnStyles: episodeDetailLevel === 'full' ? {
            8: { cellWidth: 30 } // Notes column
          } : {}
        })

        yPosition = doc.lastAutoTable.finalY + 15
      } else {
        doc.setFontSize(14)
        doc.text(t('pdf.report.episodes'), 14, yPosition)
        yPosition += 7
        doc.setFontSize(10)
        doc.setTextColor(100, 100, 100)
        doc.text(t('pdf.report.no_episodes_recorded'), 14, yPosition)
        yPosition += 15
        doc.setTextColor(0, 0, 0)
      }
    }

    // Missed Medications Section
    if (includeMissedMeds) {
      // Get missed medication logs
      const missedLogs = medicationLogs.value.filter(log => log.status === 'missed')
      const filteredMissedLogs = filterByDateRange(missedLogs, 'date')

      if (filteredMissedLogs.length > 0) {
        // Check if we need a new page
        if (yPosition > 220) {
          doc.addPage()
          yPosition = 20
        }

        doc.setFontSize(14)
        doc.setTextColor(0, 0, 0)
        doc.text(t('pdf.report.missed_medications'), 14, yPosition)
        yPosition += 7

        // Prepare table data
        const missedMedData = filteredMissedLogs.map(log => {
          const med = medications.value.find(m => m.id === log.medId)
          if (!med) return null

          const date = new Date(log.date).toLocaleDateString(locale.value)
          const medName = med.name
          const dosage = med.dosage
          const doseLabel = med.frequency > 1 
            ? t('pdf.report.dose_label', { current: log.doseIndex + 1, total: med.frequency })
            : t('pdf.report.single_dose')

          return [date, medName, dosage, doseLabel]
        }).filter(Boolean) // Remove nulls

        if (missedMedData.length > 0) {
          autoTable(doc, {
            startY: yPosition,
            head: [[t('pdf.report.date'), t('pdf.report.medication'), t('pdf.report.medication_dosage'), t('pdf.report.medication_frequency')]],
            body: missedMedData,
            theme: 'grid',
            headStyles: { fillColor: [30, 58, 138], textColor: 255 },
            styles: { fontSize: 9, cellPadding: 3 }
          })

          yPosition = doc.lastAutoTable.finalY + 15
        }
      } else {
        // Check if we need a new page
        if (yPosition > 270) {
          doc.addPage()
          yPosition = 20
        }

        doc.setFontSize(14)
        doc.text(t('pdf.report.missed_medications'), 14, yPosition)
        yPosition += 7
        doc.setFontSize(10)
        doc.setTextColor(100, 100, 100)
        doc.text(t('pdf.report.no_missed_medications_recorded'), 14, yPosition)
        doc.setTextColor(0, 0, 0)
      }
    }

    // Save the PDF
    const fileName = `EpiFriend_Report_${new Date().toISOString().slice(0, 10)}.pdf`
    doc.save(fileName)

    return { success: true, fileName }
  }

  return {
    generateMedicalPDF
  }
}
