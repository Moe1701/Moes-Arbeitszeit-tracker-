import { useState } from 'react';
import { useApp } from './context/AppContext.jsx';
import { getLocalDateString } from './utils/timeCalculations.js';
import BottomNav from './components/layout/BottomNav.jsx';

import HeuteView from './components/views/HeuteView.jsx';
import KalenderView from './components/views/KalenderView.jsx';
import PlanerView from './components/views/PlanerView.jsx';
import StatistikView from './components/views/StatistikView.jsx';
import SetupView from './components/views/SetupView.jsx';

export default function App() {
    const { appData } = useApp();
    const [activeTab, setActiveTab] = useState('heute');
    
    // Globaler Datums-State, der von Kalender zu Heute gereicht wird
    const [selectedDate, setSelectedDate] = useState(getLocalDateString(new Date()));

    const goToHeute = (dateStr) => {
        setSelectedDate(dateStr);
        setActiveTab('heute');
    };

    const renderView = () => {
        switch (activeTab) {
            case 'heute': return <HeuteView selectedDate={selectedDate} setSelectedDate={setSelectedDate} />;
            case 'kalender': return <KalenderView goToHeute={goToHeute} />;
            case 'planer': return <PlanerView />;
            case 'statistik': return <StatistikView />;
            case 'setup': return <SetupView />;
            default: return <HeuteView selectedDate={selectedDate} setSelectedDate={setSelectedDate} />;
        }
    };

    return (
        <div className="flex flex-col h-dvh overflow-hidden">
            <main className="flex-1 overflow-y-auto w-full max-w-lg mx-auto relative pt-3 pb-2 px-3 flex flex-col">
                {renderView()}
            </main>
            <div className="w-full max-w-lg mx-auto shrink-0 z-20">
                <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>
        </div>
    );
}