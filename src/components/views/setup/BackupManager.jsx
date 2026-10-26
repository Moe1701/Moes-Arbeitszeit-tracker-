import React, { useRef } from 'react';

export default function BackupManager({ appData, updateAppData }) {
    const fileInputRef = useRef(null);

    const exportData = () => {
        try {
            const dataStr = JSON.stringify(appData, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Zeiterfassung_Backup_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            alert("Fehler beim Erstellen der Backup-Datei.");
        }
    };

    const handleFileImport = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const parsed = JSON.parse(e.target.result);
                if (parsed && parsed.entries && parsed.settings) {
                    if (window.confirm("⚠️ Warnung: Dies überschreibt alle aktuellen Daten in der App mit dem Backup. Fortfahren?")) {
                        await updateAppData(parsed);
                        localStorage.setItem('zeiterfassung_db', JSON.stringify(parsed));
                        alert("✅ Backup erfolgreich wiederhergestellt!");
                        window.location.reload();
                    }
                } else {
                    alert("❌ Ungültige Backup-Datei. (Falsches Format)");
                }
            } catch(error) {
                alert("❌ Fehler beim Lesen der Datei. Sie scheint beschädigt zu sein.");
            }
            event.target.value = '';
        };
        reader.readAsText(file);
    };

    return (
        <div className="bg-indigo-50 p-4 rounded-xl shadow-sm space-y-3 border border-indigo-100">
            <h2 className="font-bold text-indigo-800 border-b border-indigo-200 pb-2 text-sm">Datensicherung (Backup)</h2>
            <p className="text-[10px] text-indigo-700 leading-tight">Lade deine Daten regelmäßig als Backup-Datei herunter. Speichere sie am besten in einem Cloud-Ordner (iCloud/Drive).</p>
            
            <button onClick={exportData} className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-sm flex items-center justify-center gap-2 active:bg-indigo-700 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                Backup-Datei speichern
            </button>
            
            <div className="pt-1">
                <input type="file" ref={fileInputRef} accept=".json" className="hidden" onChange={handleFileImport} />
                <button onClick={() => fileInputRef.current?.click()} className="w-full py-3 bg-white text-indigo-700 border border-indigo-200 font-bold rounded-xl shadow-sm flex items-center justify-center gap-2 active:bg-indigo-50 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                    Backup wiederherstellen
                </button>
            </div>
        </div>
    );
}