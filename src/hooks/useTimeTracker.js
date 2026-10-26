/**
 * src/hooks/useTimeTracker.js
 * Custom Hook für die Interaktion mit dem täglichen Zeiterfassungs-State.
 * Nutzt den globalen AppContext und die isolierten Zeit-Utilities.
 */
import { useApp } from '../context/AppContext';
import { 
    getLocalDateString, 
    calculateDailySoll, 
    calculateNettoHours,
    suggestBreak,
    calculateMinutes
} from '../utils/timeCalculations';

export function useTimeTracker(selectedDateString) {
    const { appData, updateAppData } = useApp();

    // Lade den Eintrag für den ausgewählten Tag oder generiere einen leeren Dummy-Eintrag
    const entry = appData.entries[selectedDateString] || {
        begin: '',
        end: '',
        pause: '',
        soll: calculateDailySoll(selectedDateString, appData.settings, appData.holidays),
        remark: ''
    };

    // Helfer für Feiertage an diesem Tag
    const holiday = appData.holidays[selectedDateString];

    /**
     * Speichert oder aktualisiert den Eintrag für den ausgewählten Tag in der Datenbank.
     * Wenn alle Felder (außer Soll) leer sind und das Soll 0 ist, wird der Eintrag gelöscht, um Platz zu sparen.
     * 
     * @param {object} updatedData - Partielle Daten (z.B. { begin: "08:00", pause: 30 })
     */
    const saveEntry = async (updatedData) => {
        const mergedEntry = { ...entry, ...updatedData };
        
        // Berechne Netto und checke, ob wir eine leere Hülle löschen können
        const isCompletelyEmpty = !mergedEntry.begin && !mergedEntry.end && !mergedEntry.remark && mergedEntry.soll === 0;

        await updateAppData((prev) => {
            const newEntries = { ...prev.entries };
            
            if (isCompletelyEmpty) {
                delete newEntries[selectedDateString];
            } else {
                newEntries[selectedDateString] = mergedEntry;
            }
            
            return { ...prev, entries: newEntries };
        });
    };

    /**
     * Setzt den aktuellen Eintrag komplett zurück (inklusive Soll-Neuberechnung).
     */
    const clearEntry = async () => {
        const defaultSoll = calculateDailySoll(selectedDateString, appData.settings, appData.holidays);
        
        if (defaultSoll === 0) {
            // Wenn Soll 0 ist, können wir den Eintrag direkt aus der DB putzen
             await updateAppData((prev) => {
                const newEntries = { ...prev.entries };
                delete newEntries[selectedDateString];
                return { ...prev, entries: newEntries };
            });
        } else {
            // Andernfalls setzen wir ihn auf Standard-Werte zurück
            await saveEntry({
                begin: '',
                end: '',
                pause: '',
                soll: defaultSoll,
                remark: ''
            });
        }
    };

    /**
     * Wendet eine Vorlage (Template) auf den aktuellen Tag an.
     * @param {object} template - Z.B. { begin: "06:00", end: "14:30", pause: 30 }
     */
    const applyTemplate = async (template) => {
        await saveEntry({
            begin: template.begin,
            end: template.end,
            pause: template.pause || 30
        });
    };

    /**
     * "Kommen/Gehen" Toggle-Logik (Stempeln).
     * Nimmt die aktuelle Uhrzeit und trägt sie in "begin" ein, falls leer.
     * Andernfalls in "end". Berechnet optional automatisch eine Pausenempfehlung.
     */
    const handleQuickStamp = async () => {
        const now = new Date();
        const hh = String(now.getHours()).padStart(2, '0');
        const mm = String(now.getMinutes()).padStart(2, '0');
        const timeStr = `${hh}:${mm}`;

        let newBegin = entry.begin;
        let newEnd = entry.end;
        let newPause = parseFloat(entry.pause) || 0;

        if (!entry.begin) {
            newBegin = timeStr;
        } else {
            newEnd = timeStr;
            // Automatische Pause vorschlagen, falls noch keine gesetzt wurde
            if (!entry.pause) {
                const diffMin = calculateMinutes(newBegin, newEnd);
                newPause = suggestBreak(diffMin);
            }
        }

        await saveEntry({ begin: newBegin, end: newEnd, pause: newPause });
    };

    // Live-Berechnungen (abgeleiteter State) für die UI (View)
    const nettoHours = calculateNettoHours(entry.begin, entry.end, parseFloat(entry.pause) || 0);
    const currentSoll = parseFloat(entry.soll) || 0;
    const diffHours = nettoHours - currentSoll;

    return {
        entry,          // Die Daten des aktuellen Tages (begin, end, pause, soll, remark)
        holiday,        // Gibt es einen Feiertag / Schulferien an diesem Tag?
        nettoHours,     // Berechnete Nettozeit in Stunden (float)
        diffHours,      // Differenz zum Soll in Stunden (float, negativ bei Minusstunden)
        saveEntry,      // Funktion zum Speichern (Teil-Updates erlaubt)
        clearEntry,     // Setzt den Tag zurück
        applyTemplate,  // Wendet Schicht-Muster an
        handleQuickStamp// Kommen/Gehen Button-Logik
    };
}