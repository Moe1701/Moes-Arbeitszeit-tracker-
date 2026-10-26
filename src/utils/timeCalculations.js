/**
 * src/utils/timeCalculations.js
 * Reine Business-Logik für die Zeitberechnung (Local-First, keine React/UI-Abhängigkeiten)
 */

export function calculateMinutes(begin, end) {
    if (!begin || !end) return 0;
    const [h1, m1] = begin.split(':').map(str => parseInt(str, 10) || 0);
    const [h2, m2] = end.split(':').map(str => parseInt(str, 10) || 0);
    let diff = (h2 * 60 + m2) - (h1 * 60 + m1);
    if (diff < 0) diff += 24 * 60; 
    return diff;
}

export function calculateNettoHours(begin, end, pauseMin = 0) {
    if (!begin || !end) return 0.0;
    const bruttoMin = calculateMinutes(begin, end);
    const nettoMin = bruttoMin - pauseMin;
    return Math.max(0, nettoMin / 60);
}

export function isWeekend(date) {
    const d = typeof date === 'string' ? new Date(date) : date;
    const day = d.getDay();
    return day === 0 || day === 6;
}

export function getLocalDateString(d) {
    if (!d) return "";
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function calculateDailySoll(dateString, settings, holidays) {
    if (!settings || !settings.model || !settings.model.days) return 0.0;
    const date = new Date(dateString);
    const dayOfWeek = date.getDay();
    const isWorkDay = settings.model.days.includes(dayOfWeek);
    
    if (!isWorkDay) return 0.0;
    
    if (settings.protectHolidays && holidays && holidays[dateString] && !holidays[dateString].isSchool) {
        return 0.0;
    }
    const percent = settings.model.percentage || 100;
    const effWeekly = settings.model.hours * (percent / 100);
    const hoursPerDay = effWeekly / Math.max(1, settings.model.days.length);
    return parseFloat(hoursPerDay.toFixed(2));
}

export function suggestBreak(diffMin) {
    if (diffMin > 9 * 60) return 45;
    if (diffMin > 6 * 60) return 30;
    return 0;
}

/**
 * Berechnet den ewigen Gesamtsaldo (App-Gesamtsaldo) vom ersten Eintrag bis zum gewählten Monat.
 */
export function calculateAllTimeAppDiff(entries, settings, holidays, viewYear, viewMonth) {
    const entryKeys = Object.keys(entries);
    if (entryKeys.length === 0) return 0;
    
    entryKeys.sort();
    const firstDateStr = entryKeys[0];
    const firstDate = new Date(firstDateStr);
    firstDate.setHours(0,0,0,0);
    
    const lastDayOfViewMonth = new Date(viewYear, viewMonth + 1, 0);
    const today = new Date();
    today.setHours(0,0,0,0);
    
    const endDate = lastDayOfViewMonth;
    let totalDiff = 0;
    let d = new Date(firstDate);
    
    let iterations = 0; 
    // Max 3000 Iterationen als Endlosschleifen-Schutz (reicht für >8 Jahre Historie)
    while (d <= endDate && iterations < 3000) {
        const dStr = getLocalDateString(d);
        const entry = entries[dStr];
        const daySoll = entry && entry.soll !== undefined ? entry.soll : calculateDailySoll(dStr, settings, holidays);
        
        let netStd = 0;
        if (entry && entry.begin && entry.end) {
            const bMin = calculateMinutes(entry.begin, entry.end);
            netStd = Math.max(0, (bMin - (parseFloat(entry.pause) || 0)) / 60);
        }
        
        let dayDiff = netStd - daySoll;
        const isFuture = d > today;
        
        if (!entry && isFuture) {
            dayDiff = 0;
        } else if (!entry && !isFuture && daySoll > 0) {
            dayDiff = -daySoll;
        }
        
        totalDiff += dayDiff;
        d.setDate(d.getDate() + 1);
        iterations++;
    }
    return totalDiff;
}