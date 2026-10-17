import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, Keyboard, Platform } from 'react-native';
import { View, Feather, MaterialCommunityIcons } from './Themed';
import { Text } from './AppText';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useIsFocused } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function NavIcon({ name, size, color }) {
  return name === 'pill' ? <MaterialCommunityIcons name="pill" size={size} color={color} /> : <Feather name={name} size={size} color={color} />;
}
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring, Easing } from 'react-native-reanimated';
import AnimatedTouchable from './animated/AnimatedTouchable';
import BottomSheet from './BottomSheet';
import SettingsNavigator from '../navigation/SettingsNavigator';
import { C, RADIUS, SPACE, createStyles } from '../theme';
import { useAppearance } from '../context/AppearanceContext';

// Shared page-heading icon: the same icon is used in the bottom navigation.
function PageHeading({ title, icon }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
      <NavIcon name={icon || 'circle'} size={21} color="#fff" />
      <Text numberOfLines={1} style={{ color: '#fff', fontSize: 18, fontWeight: '600' }}>{title}</Text>
    </View>
  );
}

const Tab = createBottomTabNavigator();

// How far below its resting spot a page starts before sliding up.
const SLIDE_DISTANCE = Dimensions.get('window').height * 0.18;

// Wraps a screen so it slides up from the bottom every time its tab opens.
const slideCache = new Map();
function slideUp(Screen) {
  if (slideCache.has(Screen)) return slideCache.get(Screen);
  function SlideUpScreen(props) {
    const focused = useIsFocused();
    const progress = useSharedValue(0);
    useEffect(() => {
      progress.value = focused ? withTiming(1, { duration: 340, easing: Easing.out(Easing.cubic) }) : 0;
    }, [focused]);
    const style = useAnimatedStyle(() => ({
      opacity: progress.value,
      transform: [{ translateY: (1 - progress.value) * SLIDE_DISTANCE }],
    }));
    return <Animated.View style={[{ flex: 1 }, style]}><Screen {...props} /></Animated.View>;
  }
  slideCache.set(Screen, SlideUpScreen);
  return SlideUpScreen;
}

const CIRCLE = 54;   // diameter of the raised active circle
const RAISE = 26;    // how far the circle pokes above the bar

function TabBar({ state, navigation, icons, labels = {}, barRoutes, moreRoutes, sections }) {
  const theme = useAppearance();
  const colors = theme?.colors || C;
  const insets = useSafeAreaInsets();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [keyboardUp, setKeyboardUp] = useState(false);
  const [barWidth, setBarWidth] = useState(0);

  const focusedName = state.routes[state.index].name;
  const moreFocused = moreRoutes.includes(focusedName);

  // Every slot in the bar, in order. "More" is the last slot when there is overflow.
  const items = [
    ...barRoutes.map((name) => ({ key: name, name, label: labels[name] || name, icon: icons[name] || 'circle' })),
    ...(moreRoutes.length > 0 ? [{ key: '__more', name: '__more', label: 'More', icon: 'grid' }] : []),
  ];
  const activeIndex = moreFocused
    ? items.length - 1
    : items.findIndex((it) => it.name === focusedName);
  const slotW = barWidth / Math.max(items.length, 1);
  // Size the label so the longest single word always fits its slot. Words never break
  // across lines (no more "Medication" / "s"); multi-word labels stack one word per line.
  const longestWord = Math.max(...items.map((it) => Math.max(...it.label.split(' ').map((w) => w.length))), 1);
  const labelSize = Math.max(7, Math.min(10, (slotW - 6) / (longestWord * 0.58)));

  // The circle slides to the active slot and pops a little on arrival.
  const circleX = useSharedValue(0);
  const pop = useSharedValue(1);
  const placed = useRef(false);
  useEffect(() => {
    if (!barWidth || activeIndex < 0) return;
    const target = activeIndex * slotW + (slotW - CIRCLE) / 2;
    if (!placed.current) { circleX.value = target; placed.current = true; return; }
    circleX.value = withSpring(target, { damping: 14, stiffness: 150, mass: 0.8 });
    pop.value = 0.82;
    pop.value = withSpring(1, { damping: 8, stiffness: 180 });
  }, [activeIndex, barWidth, slotW]);
  const notchStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: circleX.value }],
  }));
  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: circleX.value }, { scale: pop.value }],
  }));

  useEffect(() => {
    const show = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', () => setKeyboardUp(true));
    const hide = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => setKeyboardUp(false));
    return () => { show.remove(); hide.remove(); };
  }, []);

  if (keyboardUp) return null;

  const goTo = (name) => {
    const route = state.routes.find((r) => r.name === name);
    if (!route) return;
    const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
    if (!event.defaultPrevented) navigation.navigate(name);
  };

  const activeItem = activeIndex >= 0 ? items[activeIndex] : null;

  // Overflow sheet content, grouped the same way the old sidebar was.
  const grouped = (sections || [])
    .map((s) => ({ title: s.title, routes: s.routes.filter((n) => moreRoutes.includes(n)) }))
    .filter((s) => s.routes.length);
  const ungrouped = moreRoutes.filter((n) => !grouped.some((g) => g.routes.includes(n)));
  if (ungrouped.length) grouped.push({ title: 'Account', routes: ungrouped });

  return (
    <View style={[styles.wrap, { backgroundColor: colors.bg, paddingBottom: Math.max(insets.bottom, 10) }]}>
      <View style={[styles.bar, { backgroundColor: colors.white }]} onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}>
        {barWidth > 0 && activeItem && (
          <>
            <Animated.View pointerEvents="none" style={[styles.notch, { backgroundColor: colors.bg }, notchStyle]} />
            <Animated.View pointerEvents="none" style={[styles.circle, { backgroundColor: colors.blue }, circleStyle]}>
              <NavIcon name={activeItem.icon} size={22} color="#fff" />
            </Animated.View>
          </>
        )}

        {items.map((it, idx) => {
          const active = idx === activeIndex;
          return (
            <AnimatedTouchable
              key={it.key}
              scaleTo={0.94}
              style={styles.item}
              onPress={() => (it.name === '__more' ? setSheetOpen(true) : goTo(it.name))}
            >
              {!active && <NavIcon name={it.icon} size={20} color={colors.slate} />}
              {it.label.split(' ').map((word, wi) => (
                <Text
                  key={wi}
                  style={[styles.label, { color: active ? colors.navyMid : colors.slate }, active && styles.labelActive, { fontSize: labelSize }]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.7}
                >
                  {word}
                </Text>
              ))}
            </AnimatedTouchable>
          );
        })}
      </View>

      <BottomSheet visible={sheetOpen} onClose={() => setSheetOpen(false)} title="All sections" icon="grid">
        {grouped.map((sec) => (
          <View key={sec.title} style={{ marginBottom: SPACE.md }}>
            <Text style={styles.sheetSection}>{sec.title}</Text>
            {sec.routes.map((name) => {
              const active = focusedName === name;
              return (
                <AnimatedTouchable
                  key={name}
                  scaleTo={0.98}
                  onPress={() => { setSheetOpen(false); goTo(name); }}
                  style={[styles.sheetRow, active && styles.sheetRowActive]}
                >
                  <View style={[styles.sheetIcon, active && { backgroundColor: C.navyMid }]}>
                    <NavIcon name={icons[name] || 'circle'} size={16} color={active ? '#fff' : C.navyMid} />
                  </View>
                  <Text style={[styles.sheetLabel, active && { color: C.navyMid }]}>{name}</Text>
                  <Feather name="chevron-right" size={16} color={C.muted} />
                </AnimatedTouchable>
              );
            })}
          </View>
        ))}
      </BottomSheet>
    </View>
  );
}

// One bottom tab navigator for every role.
//  screens: [{ name, component, options? }]
//  primary: route names shown in the bar. Everything else (plus Settings) goes
//           into a "More" sheet that slides up. Omit it to show every screen
//           plus Settings directly in the bar.
export default function RoleTabs({ portalName, screens, icons, labels = {}, primary, sections }) {
  const theme = useAppearance();
  const colors = theme?.colors || C;
  const names = screens.map((s) => s.name);
  const barRoutes = primary || [...names, 'Settings'];
  const moreRoutes = primary ? [...names.filter((n) => !primary.includes(n)), 'Settings'] : [];
  const allIcons = { ...icons, Settings: 'settings' };

  return (
    <Tab.Navigator
      tabBar={(props) => (
        <TabBar {...props} icons={allIcons} labels={labels} barRoutes={barRoutes} moreRoutes={moreRoutes} sections={sections} />
      )}
      screenOptions={{
        headerStyle: { backgroundColor: colors.header },
        headerTintColor: '#fff',
        headerTitleAlign: 'center',
        headerTitleStyle: { fontFamily: 'Poppins_600SemiBold', fontWeight: 'normal' },
        headerShadowVisible: false,
        sceneStyle: { backgroundColor: colors.bg },
      }}
      sceneContainerStyle={{ backgroundColor: colors.bg }}
    >
      {screens.map((s) => (
        <Tab.Screen key={s.name} name={s.name} component={slideUp(s.component)} options={{ ...s.options, headerTitle: () => <PageHeading title={s.options?.title || s.name} icon={allIcons[s.name]} /> }} />
      ))}
      <Tab.Screen
        name="Settings"
        component={slideUp(SettingsNavigator)}
        initialParams={{ portalName }}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
}

const styles = createStyles({
  // Same colour as the screens, so the ring around the circle reads as a notch cut into the bar.
  wrap: { backgroundColor: C.bg, paddingTop: RAISE + 2, paddingHorizontal: 16 },
  bar: {
    flexDirection: 'row', backgroundColor: C.white, borderRadius: 28, height: 64,
    shadowColor: '#2b2d6e', shadowOpacity: 0.14, shadowRadius: 14, shadowOffset: { width: 0, height: 4 }, elevation: 10,
  },
  notch: {
    position: 'absolute', top: -RAISE - 7, left: -8,
    width: CIRCLE + 16, height: CIRCLE + 16,
    borderRadius: (CIRCLE + 16) / 2, zIndex: 1,
  },
  circle: {
    position: 'absolute', top: -RAISE, left: 0, width: CIRCLE, height: CIRCLE, borderRadius: CIRCLE / 2,
    backgroundColor: C.blue, borderWidth: 3, borderColor: C.white, alignItems: 'center', justifyContent: 'center',
    zIndex: 2,
    shadowColor: '#2b2d6e', shadowOpacity: 0.38, shadowRadius: 10, shadowOffset: { width: 0, height: 5 }, elevation: 9,
  },
  item: { flex: 1, minWidth: 0, alignItems: 'center', justifyContent: 'flex-end', gap: 2, paddingBottom: 7, paddingHorizontal: 3 },
  label: { fontWeight: '600', color: C.slate, textAlign: 'center', width: '100%' },
  labelActive: { color: C.navyMid, fontWeight: '800' },
  sheetSection: {
    color: C.textMuted, fontSize: 10.5, fontWeight: '700', letterSpacing: 0.6,
    textTransform: 'uppercase', marginBottom: 6,
  },
  sheetRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10,
    borderRadius: RADIUS.md, marginBottom: 4,
  },
  sheetRowActive: { backgroundColor: C.blueSoft },
  sheetIcon: {
    width: 34, height: 34, borderRadius: RADIUS.sm, backgroundColor: C.blueSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  sheetLabel: { flex: 1, fontSize: 14.5, fontWeight: '600', color: C.text },
});
