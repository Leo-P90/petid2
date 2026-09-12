import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { Keyboard, Platform, ScrollView, View } from 'react-native';
import { focusScroll, imeOverlap } from '../core/keyboard';
type Target = RefObject<View | null>;
const FocusContext = createContext<(target: Target | null) => void>(() => undefined);
export const useKeyboardFocus = () => useContext(FocusContext);
export function KeyboardScreen({ children, bottom = 32, followEnd = false }: { children: ReactNode; bottom?: number; followEnd?: boolean }) {
  const host = useRef<View>(null);
  const viewport = useRef<View>(null);
  const scroll = useRef<ScrollView>(null);
  const target = useRef<Target | null>(null);
  const keyboardTop = useRef<number | null>(null);
  const offset = useRef(0);
  const frame = useRef<number | null>(null);
  const [inset, setInset] = useState(0);
  const [open, setOpen] = useState(false);
  const reveal = useCallback(() => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const top = keyboardTop.current;
      if (top === null) return;
      viewport.current?.measureInWindow((_x, y, _w, height) => {
        target.current?.current?.measureInWindow((_fx, fy, _fw, fh) => {
          const next = focusScroll(offset.current, { y: fy, height: fh }, { y, height }, top);
          scroll.current?.scrollTo({ y: next, animated: true });
        });
      });
    });
  }, []);
  const layout = useCallback(() => {
    host.current?.measureInWindow((_x, y, _w, height) => {
      setInset(imeOverlap({ y, height }, keyboardTop.current));
      reveal();
    });
  }, [reveal]);
  useEffect(() => {
    if (Platform.OS === 'web') return;
    const show = Keyboard.addListener('keyboardDidShow', (event) => {
      keyboardTop.current = event.endCoordinates.screenY;
      setOpen(true);
      layout();
    });
    const hide = Keyboard.addListener('keyboardDidHide', () => {
      keyboardTop.current = null; setInset(0); setOpen(false);
    });
    return () => { show.remove(); hide.remove(); if (frame.current !== null) cancelAnimationFrame(frame.current); };
  }, [layout]);
  return <FocusContext.Provider value={(next) => { target.current = next; if (next) reveal(); }}>
    {/* Measure the fixed outer frame, not the padded scroll frame: no double inset after adjustResize. */}
    <View ref={host} onLayout={layout} style={{ flex: 1, paddingBottom: inset }}>
      <View ref={viewport} onLayout={reveal} style={{ flex: 1 }}>
      <ScrollView ref={scroll} onLayout={reveal} onContentSizeChange={() => { if (followEnd) { scroll.current?.scrollToEnd({ animated: false }); reveal(); } }} onScroll={(event) => { offset.current = event.nativeEvent.contentOffset.y; }} scrollEventThrottle={16}
        keyboardShouldPersistTaps="handled" keyboardDismissMode="none"
        contentContainerStyle={{ padding: 18, paddingBottom: open ? 32 : bottom, gap: 14, width: '100%', maxWidth: 640, alignSelf: 'center' }}>
        {children}
      </ScrollView>
      </View>
    </View>
  </FocusContext.Provider>;
}
