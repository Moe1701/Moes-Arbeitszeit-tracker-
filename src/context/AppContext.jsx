// src/context/AppContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { loadFromDB, saveToDB, requestPersistence } from '../services/db';

const AppContext = createContext();

const defaultState = {
    entries: {},
    templates: [
        { id: 1, name: "Früh", begin: "06:00", end: "14:30", pause: 30 },
        { id: 2, name: "Spät", begin: "14:00", end: "22:30", pause: 30 }
    ],
    settings: {
        state: "NW", agSaldo: 0.0,
        model: { hours: 40, days: [1, 2, 3, 4, 5], percentage: 100 },
        protectHolidays: true
    },
    holidays: {},
    activePauseStart: null
};

export function AppProvider({ children }) {
    const [appData, setAppData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initApp = async () => {
            await requestPersistence();
            try {
                const savedData = await loadFromDB();
                if (savedData) {
                    setAppData({ ...defaultState, ...savedData });
                } else {
                    // Fallback-Migration für alte LocalStorage-Nutzer
                    const lsData = localStorage.getItem('zeiterfassung_db');
                    if (lsData) {
                        const parsed = JSON.parse(lsData);
                        setAppData({ ...defaultState, ...parsed });
                        await saveToDB({ ...defaultState, ...parsed });
                    } else {
                        setAppData(defaultState);
                        await saveToDB(defaultState);
                    }
                }
            } catch (error) {
                console.error("Datenbank Fehler:", error);
                setAppData(defaultState);
            } finally {
                setIsLoading(false);
            }
        };
        initApp();
    }, []);

    // Ersetzt das alte manuelle saveData() – React State & IndexedDB bleiben 100% synchron
    const updateAppData = async (newDataOrUpdater) => {
        setAppData((prev) => {
            const updated = typeof newDataOrUpdater === 'function' ? newDataOrUpdater(prev) : newDataOrUpdater;
            saveToDB(updated).catch(console.error);
            return updated;
        });
    };

    return (
        <AppContext.Provider value={{ appData, updateAppData, isLoading }}>
            {!isLoading ? children : <div className="flex h-screen items-center justify-center font-bold text-slate-500">System startet...</div>}
        </AppContext.Provider>
    );
}

export const useApp = () => useContext(AppContext);