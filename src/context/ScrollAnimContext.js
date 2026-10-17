import { createContext } from 'react';

// Shared scroll-Y value provided by <AnimatedScreen>. Consumed by <Reveal> so
// every card/tile it wraps re-animates in as it crosses into the viewport —
// on every scroll pass, not just once on mount.
export const ScrollAnimContext = createContext(null);
