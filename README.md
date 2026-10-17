# MediCare Mobile (pilot — Patient flow)

React Native (Expo) rewrite of the Patient side of the web portal: Login,
Overview, Medications, Medical History, Daily Schedule (reminders), and Book
Appointment. Other roles (Doctor/Admin/Reception/Pharmacist/Lab) still only
exist on the web portal — logging in as one of them shows a placeholder screen.

## Run it locally

```
cd mobile
npm install
npx expo start
```

Scan the QR code with **Expo Go** (Android/iOS) or press `a` / `i` for an
emulator/simulator.

### Pointing at the backend

Edit `mobile/.env`:

```
EXPO_PUBLIC_API_URL=http://<your-computer-LAN-IP>:8000
```

- **Android emulator**: `http://10.0.2.2:8000` works out of the box (default
  if `.env` is removed).
- **Physical phone / iOS simulator**: use your computer's LAN IP (must be on
  the same Wi-Fi as the backend) — find it with `ipconfig` (Windows) and look
  for "IPv4 Address". The backend's `uvicorn` must also be listening on
  `0.0.0.0`, not just `127.0.0.1`, for a phone to reach it.

Restart `expo start` after changing `.env`.

## Building APK / IPA (EAS Build)

One-time setup:

```
npm install -g eas-cli
eas login
eas build:configure
```

Android APK (installable directly, no Play Store needed):

```
eas build --platform android --profile preview
```

iOS IPA — requires an active **Apple Developer Program** membership
($99/year), even for a cloud build:

```
eas build --platform ios --profile preview
```

Both commands build on Expo's servers and give you a download link when
done — no local Xcode or Android Studio required. `eas.json` already has
`development` / `preview` / `production` profiles configured.

## Structure

```
src/
  api/client.js            axios instance + JWT header + 401 handling
  context/AuthContext.js   session persisted in AsyncStorage
  context/PatientDataContext.js   shared dashboard/reminders/prescriptions state
  hooks/useLiveNotifications.js   shared WebSocket (mirrors dashboardChrome.js)
  navigation/PatientTabs.js       bottom-tab shell for the patient screens
  screens/patient/*.js      Overview, Medications, History, Reminders, Booking
  utils/                    toast, time-slot formatting, reminder grouping
```
