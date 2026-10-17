import React from 'react';
import RoleTabs from '../components/RoleTabs';
import { LabDataProvider } from '../context/LabDataContext';
import LabOverviewScreen from '../screens/lab/LabOverviewScreen';
import LabSamplesScreen from '../screens/lab/LabSamplesScreen';
import LabReportsScreen from '../screens/lab/LabReportsScreen';

const ICONS = { Overview: 'home', Samples: 'activity', Reports: 'file-text' };

const SCREENS = [
  { name: 'Overview', component: LabOverviewScreen, options: { title: 'Lab Portal' } },
  { name: 'Samples', component: LabSamplesScreen },
  { name: 'Reports', component: LabReportsScreen },
];

export default function LabTabs() {
  return (
    <LabDataProvider>
      <RoleTabs portalName="Lab Portal" screens={SCREENS} icons={ICONS} />
    </LabDataProvider>
  );
}
