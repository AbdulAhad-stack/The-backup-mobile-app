import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RoleTabs from '../components/RoleTabs';
import { DoctorDataProvider } from '../context/DoctorDataContext';
import DoctorOverviewScreen from '../screens/doctor/DoctorOverviewScreen';
import DoctorPatientsListScreen from '../screens/doctor/DoctorPatientsListScreen';
import DoctorPatientDetailScreen from '../screens/doctor/DoctorPatientDetailScreen';
import DoctorAssignedScreen from '../screens/doctor/DoctorAssignedScreen';
import DoctorConsultationScreen from '../screens/doctor/DoctorConsultationScreen';
import { useAppearance } from '../context/AppearanceContext';
import { View, Feather } from '../components/Themed';
import { Text } from '../components/AppText';

const RecordHeading = ({ title }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
    <Feather name="users" size={21} color="#fff" />
    <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600' }}>{title}</Text>
  </View>
);

const PatientsStack = createNativeStackNavigator();
const ICONS = { Overview: 'home', 'Patient Records': 'users', 'Assigned to Me': 'activity', Consultation: 'file-plus' };
const LABELS = { Overview: 'Overview', 'Patient Records': 'Patients', 'Assigned to Me': 'Assigned', Consultation: 'Consultation', Settings: 'Settings' };

// Patient detail opens from the bottom, same as every other page.
function PatientsStackNav() {
  const { colors } = useAppearance();
  return (
    <PatientsStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.header },
        contentStyle: { backgroundColor: colors.bg },
        headerTintColor: '#fff',
        headerTitleAlign: 'center',
        headerTitleStyle: { fontFamily: 'Poppins_600SemiBold', fontWeight: 'normal' },
        headerShadowVisible: false,
      }}
    >
      <PatientsStack.Screen name="PatientsList" component={DoctorPatientsListScreen} options={{ headerTitle: () => <RecordHeading title="Patient Records" /> }} />
      <PatientsStack.Screen name="PatientDetail" component={DoctorPatientDetailScreen} options={{ headerTitle: () => <RecordHeading title="Patient Detail" />, animation: 'slide_from_bottom' }} />
    </PatientsStack.Navigator>
  );
}

const SCREENS = [
  { name: 'Overview', component: DoctorOverviewScreen, options: { title: 'Physician Portal' } },
  { name: 'Patient Records', component: PatientsStackNav, options: { headerShown: false } },
  { name: 'Assigned to Me', component: DoctorAssignedScreen },
  { name: 'Consultation', component: DoctorConsultationScreen },
];

export default function DoctorTabs() {
  return (
    <DoctorDataProvider>
      <RoleTabs portalName="Physician Portal" screens={SCREENS} icons={ICONS} labels={LABELS} />
    </DoctorDataProvider>
  );
}
