import React from 'react';
import { useApp } from '../../context/AppContext';
import ModelSettings from './setup/ModelSettings';
import TemplateManager from './setup/TemplateManager';
import HolidaySettings from './setup/HolidaySettings';
import BackupManager from './setup/BackupManager';

export default function SetupView() {
    const { appData, updateAppData } = useApp();

    return (
        <div className="flex flex-col gap-4 pb-4">
            <ModelSettings appData={appData} updateAppData={updateAppData} />
            <TemplateManager appData={appData} updateAppData={updateAppData} />
            <HolidaySettings appData={appData} updateAppData={updateAppData} />
            <BackupManager appData={appData} updateAppData={updateAppData} />
        </div>
    );
}