import React from 'react';
import { TouchableOpacity, Feather } from './Themed';
import { useNavigation, DrawerActions } from '@react-navigation/native';

// Drawer screens don't get a stack-style back button by default — only the
// hamburger. On the home/Overview screen we keep the hamburger (opens the
// drawer); on every other screen we show a back arrow to Overview instead,
// so users always have a visible way back without reopening the drawer.
export default function HeaderLeft({ home = 'Overview' }) {
  const navigation = useNavigation();
  const state = navigation.getState();
  const isHome = state?.routes?.[state.index]?.name === home;

  if (isHome) {
    return (
      <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())} style={{ marginLeft: 12, padding: 4 }}>
        <Feather name="menu" size={22} color="#fff" />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={() => navigation.navigate(home)} style={{ marginLeft: 12, padding: 4 }}>
      <Feather name="arrow-left" size={22} color="#fff" />
    </TouchableOpacity>
  );
}
