import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { calculateDailySoll, calculateMinutes } from '../utils/timeCalculations';

export function exportMonthPDF(appData, year, month, monthName) {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Arbeitszeitnachweis - ${monthName} ${year}`, 14, 20);

    let tableData = [];
    let daysInMonth = new Date(year, month + 1, 0).getDate();
    let totalNet = 0;

    let today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 1; i <= daysInMonth; i++) {
        let dStr = `${year}-${String(month+1).padStart(2,'0')}-${String(i).padStart(2,'0')}`;
        let dateObj = new Date(dStr);
        let dayName = dateObj.toLocaleDateString('de-DE', { weekday: 'short' });
        let dateFormatted = `${String(i).padStart(2,'0')}.${String(month+1).padStart(2,'0')}.`;

        let entry = appData.entries[dStr];
        let daySoll = entry && entry.soll !== undefined ? entry.soll : calculateDailySoll(dStr, appData.settings, appData.holidays);
        
        let begin = entry && entry.begin ? entry.begin : '-';
        let end = entry && entry.end ? entry.end : '-';
        let pause = entry && entry.pause !== undefined ? entry.pause : '0';
        let remark = entry && entry.remark ? entry.remark : '';
        
        let netStd = 0;
        if (entry && entry.begin && entry.end) {
            let bMin = calculateMinutes(entry.begin, entry.end);
            netStd = Math.max(0, (bMin - (parseFloat(entry.pause) || 0)) / 60);
        }
        
        let dayDiff = netStd - daySoll;
        let isFuture = dateObj > today; 
        
        if(!entry && isFuture) dayDiff = 0;
        else if (!entry && !isFuture && daySoll > 0) dayDiff = -daySoll;

        totalNet += netStd;

        let netStr = netStd > 0 ? netStd.toFixed(2) : '-';
        let sollStr = daySoll > 0 ? daySoll.toFixed(2) : '0.00';
        let diffStr = dayDiff !== 0 ? (dayDiff > 0 ? '+' : '') + dayDiff.toFixed(2) : '0.00';

        tableData.push([
            `${dayName}, ${dateFormatted}`,
            begin,
            end,
            pause.toString(),
            netStr,
            sollStr,
            diffStr,
            remark
        ]);
    }

    let percent = appData.settings.model.percentage || 100;
    let effWeekly = appData.settings.model.hours * (percent / 100);
    let hrMonthlySoll = effWeekly * 13 / 3;

    doc.autoTable({
        startY: 28,
        head: [['Datum', 'Beginn', 'Ende', 'Pause (m)', 'Ist (h)', 'Soll (h)', '+/- (h)', 'Bemerkung']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [37, 99, 235] }, 
        styles: { fontSize: 8 },
        columnStyles: {
            0: { cellWidth: 26 },
            1: { cellWidth: 16, halign: 'center' },
            2: { cellWidth: 16, halign: 'center' },
            3: { cellWidth: 18, halign: 'center' },
            4: { cellWidth: 15, halign: 'right' },
            5: { cellWidth: 15, halign: 'right' },
            6: { cellWidth: 15, halign: 'right' },
            7: { cellWidth: 'auto' }
        }
    });

    let finalY = doc.lastAutoTable.finalY + 12;
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('Zusammenfassung:', 14, finalY);
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Gesamt Ist-Arbeitszeit: ${totalNet.toFixed(2)} h`, 14, finalY + 8);
    doc.text(`HR Monats-Soll (Formel): ${hrMonthlySoll.toFixed(2)} h`, 14, finalY + 14);
    
    let hrDiff = totalNet - hrMonthlySoll;
    let hrDiffStr = (hrDiff > 0 ? '+' : '') + hrDiff.toFixed(2);
    doc.text(`Monats-Differenz (Ist vs. Formel): ${hrDiffStr} h`, 14, finalY + 20);

    doc.save(`Zeiterfassung_${monthName}_${year}.pdf`);
}