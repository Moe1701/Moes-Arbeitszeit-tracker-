import React, { useState } from 'react';

export default function HolidaySettings({ appData, updateAppData }) {
    const [isFetchingHolidays, setIsFetchingHolidays] = useState(false);
    const bundesland = appData.settings.state;

    const updateState = async (val) => {
        await updateAppData(prev => ({ ...prev, settings: { ...prev.settings, state: val } }));
    };

    const fetchHolidays = async () => {
        setIsFetchingHolidays(true);
        const year = new Date().getFullYear();
        
        try {
            const fetchedHolidays = { ...appData.holidays };

            const loadAPI = async (y, isSchool) => {
                const typeUrl = isSchool ? "SchoolHolidays" : "PublicHolidays";
                const url = `https://openholidaysapi.org/${typeUrl}?countryIsoCode=DE&languageIsoCode=DE&validFrom=${y}-01-01&validTo=${y}-12-31&subdivisionCode=DE-${bundesland}`;
                const res = await fetch(url);
                const data = await res.json();
                
                data.forEach(item => {
                    const name = item.name[0].text;
                    const start = new Date(item.startDate);
                    const end = new Date(item.endDate);
                    for (let dt = new Date(start); dt <= end; dt.setDate(dt.getDate() + 1)) {
                        const dStr = dt.toISOString().split('T')[0];
                        if (!fetchedHolidays[dStr] || (!isSchool && fetchedHolidays[dStr].isSchool)) {
                            fetchedHolidays[dStr] = { name: name, isSchool: isSchool };
                        }
                    }
                });
            };

            await loadAPI(year, false); await loadAPI(year + 1, false);
            await loadAPI(year, true); await loadAPI(year + 1, true);

            await updateAppData(prev => ({ ...prev, holidays: fetchedHolidays }));
            alert("Feiertage und Ferien wurden erfolgreich aktualisiert!");
        } catch (e) {
            alert("Fehler beim Abrufen der Daten. Bitte prüfen Sie Ihre Internetverbindung.");
        }
        setIsFetchingHolidays(false);
    };

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm space-y-3 border border-slate-100">
            <h2 className="font-bold text-slate-800 border-b border-slate-100 pb-2 text-sm">Bundesland</h2>
            <select value={bundesland} onChange={e => updateState(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none">
                <option value="BW">Baden-Württemberg</option><option value="BY">Bayern</option><option value="BE">Berlin</option>
                <option value="BB">Brandenburg</option><option value="HB">Bremen</option><option value="HH">Hamburg</option>
                <option value="HE">Hessen</option><option value="MV">Mecklenburg-Vorpommern</option><option value="NI">Niedersachsen</option>
                <option value="NW">Nordrhein-Westfalen</option><option value="RP">Rheinland-Pfalz</option><option value="SL">Saarland</option>
                <option value="SN">Sachsen</option><option value="ST">Sachsen-Anhalt</option><option value="SH">Schleswig-Holstein</option>
                <option value="TH">Thüringen</option>
            </select>
            <button 
                onClick={fetchHolidays} disabled={isFetchingHolidays}
                className={`w-full py-3 text-white font-bold rounded-xl shadow-sm text-sm transition-colors ${isFetchingHolidays ? 'bg-emerald-400 cursor-not-allowed' : 'bg-emerald-500 active:bg-emerald-600'}`}
            >
                {isFetchingHolidays ? 'Lädt...' : 'Jahresdaten aktualisieren'}
            </button>
        </div>
    );
}