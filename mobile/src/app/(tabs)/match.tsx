import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Image, Keyboard, Modal, PanResponder, Pressable, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Button, Card, Field, Label, Note, Screen, MatchScreen, Paw, PetSelector, useSectionColors } from '../../components/ui';
import { KeyboardScreen } from '../../components/keyboard-screen';
import { discoverMatches, emptyMatch, validMessage, type Candidate } from '../../core/match-model';
import { exitDuration, swipeChoice } from '../../core/match-motion';
import { matchDemo } from '../../data/match-demo';
import { useApp } from '../../state/app-state';
import { useAuth } from '../../state/auth-state';
import { MatchAccount } from '../../components/match-account';
function Portrait({ candidate, small = false, live = false }: { candidate: Candidate; small?: boolean; live?: boolean }) {
  const colors = useSectionColors('match'); const [failed, setFailed] = useState(false);
  return <View style={{ height: small ? 48 : '100%', width: small ? 48 : '100%', borderRadius: small ? 16 : 28, overflow: 'hidden', backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center' }}>
    {candidate.photo && !failed ? <Image accessibilityLabel={candidate.name + (live ? ' · paylaşılan fotoğraf' : ' · demo fotoğraf')} source={{ uri: candidate.photo }} onError={() => setFailed(true)} style={{ height: '100%', width: '100%' }} resizeMode="cover" /> : <View accessibilityLabel="Fotoğraf paylaşılmadı" style={{ alignItems: 'center', gap: 18 }}><Paw size={small ? 26 : 72} />{!small ? <Text style={{ color: colors.muted }}>Fotoğraf paylaşılmadı</Text> : null}</View>}
  </View>;
}
export function SwipeCard({ candidate, choose, reduced, live = false, undo, canUndo = false, info }: { candidate: Candidate; choose: (like: boolean) => void; reduced: boolean; live?: boolean; undo?: () => void; canUndo?: boolean; info?: () => void }) {
  const colors = useSectionColors('match'); const { width } = useWindowDimensions(); const [x] = useState(() => new Animated.Value(0));
  const locked = useRef(false); const alive = useRef(true); const [busy, setBusy] = useState(false);
  useEffect(() => { alive.current = true; return () => { alive.current = false; x.stopAnimation(); }; }, [x]);
  function commit(like: boolean) {
    if (locked.current) return; locked.current = true; setBusy(true);
    const finish = () => { if (alive.current) choose(like); };
    if (reduced) { finish(); return; }
    Animated.timing(x, { toValue: (like ? 1 : -1) * width * 1.3, duration: exitDuration(reduced), useNativeDriver: true }).start(({ finished }) => { if (finished) finish(); });
  }
  // PanResponder stores these callbacks; refs are read only by native gesture events, never by the factory.
  // eslint-disable-next-line react-hooks/refs
  const pan = PanResponder.create({
    onMoveShouldSetPanResponder: (_e, g) => !locked.current && Math.abs(g.dx) > 12 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
    onPanResponderMove: (_e, g) => x.setValue(g.dx),
    onPanResponderRelease: (_e, g) => { const choice = swipeChoice(g.dx); if (choice) commit(choice === 'like'); else if (reduced) x.setValue(0); else Animated.spring(x, { toValue: 0, useNativeDriver: true, friction: 7 }).start(); },
    onPanResponderTerminate: () => x.setValue(0),
  });
  // The action list only stores native press callbacks; commit reads refs on press, not render.
  // eslint-disable-next-line react-hooks/refs
  return <><Animated.View {...pan.panHandlers} testID="match-swipe-card" style={{ flex: 1, minHeight: 240, borderRadius: 28, overflow: 'hidden', transform: [{ translateX: x }, { rotate: reduced ? '0deg' : x.interpolate({ inputRange: [-width, 0, width], outputRange: ['-14deg', '0deg', '14deg'] }) }] }}><Portrait candidate={candidate} live={live} /><LinearGradient pointerEvents="none" colors={['transparent', '#10111655', '#101116F5']} locations={[0, .4, 1]} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 22, paddingTop: 100, gap: 7 }}><View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}><Text accessibilityRole="header" style={{ fontSize: 30, fontWeight: '800', color: '#FFFFFF' }}>{candidate.name}</Text><Text style={{ color: '#FFFFFF', fontSize: 18 }}>{candidate.age}</Text><Text accessibilityLabel="Profil onayı" style={{ color: '#D7CEFF', fontSize: 11 }}>{candidate.verification === 'verified' ? '✓ Onaylı profil' : candidate.verification === 'pending' ? 'İncelemede' : candidate.verification === 'rejected' ? 'Onaylanmadı' : 'Onay bilgisi yok'}</Text></View><Text style={{ color: '#FFFFFF', fontSize: 14 }}>{candidate.species} · {candidate.breed} · {candidate.gender}</Text><Text style={{ color: '#E3DFF0', fontSize: 13 }}>{candidate.distance}</Text></LinearGradient></Animated.View><View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly', paddingVertical: 6 }}>{[{ label: 'Geri al', symbol: '↶', action: undo, disabled: !canUndo, color: colors.accent, size: 50 }, { label: 'Geç', symbol: '×', action: () => commit(false), color: '#FFFFFF', size: 62 }, { label: 'Aday bilgisi', symbol: 'i', action: info, color: colors.accent, size: 50 }, { label: live ? 'Beğen' : 'Beğen · demo', symbol: '♥︎', action: () => commit(true), color: '#FFFFFF', size: 70 }].map(item => <Pressable key={item.label} accessibilityRole="button" accessibilityLabel={item.label} accessibilityState={{ disabled: busy || !!item.disabled || !item.action }} disabled={busy || !!item.disabled || !item.action} onPress={item.action} style={{ width: item.size, height: item.size, borderRadius: item.size / 2, alignItems: 'center', justifyContent: 'center', backgroundColor: item.label.startsWith('Beğen') ? '#F43F5E' : colors.surface, borderWidth: 1, borderColor: item.label.startsWith('Beğen') ? '#F43F5E' : colors.border, opacity: item.disabled ? .4 : 1 }}><Text style={{ fontSize: item.label.startsWith('Beğen') ? 35 : 28, color: item.color }}>{item.symbol}</Text></Pressable>)}</View></>;
}
export default function Match() {
  const { pet, accountMode } = useApp(); const auth = useAuth();
  if (accountMode && auth.session) return <MatchAccount key={auth.session.user.id + '/' + pet.id} ownerId={auth.session.user.id} pet={pet} renderCandidate={(candidate, choose, key, actions) => <SwipeCard key={key} candidate={candidate} choose={choose} reduced live undo={actions.undo} canUndo={actions.canUndo} info={actions.info} />} />;
  return <MatchExperience key={pet.id} />;
}
function MatchExperience() {
  const { pet, matches, dispatchMatch } = useApp(); const colors = useSectionColors('match'); const state = matches[pet.id] ?? emptyMatch(); const candidate = discoverMatches(pet, state, matchDemo)[0];
  const [section, setSection] = useState('Keşfet');
  const [settings, setSettings] = useState(false); const [info, setInfo] = useState(false); const [passed, setPassed] = useState<Candidate[]>([]);
  const [celebration, setCelebration] = useState<{ petId: string; candidate: Candidate } | null>(null);
  const [active, setActive] = useState<{ petId: string; candidateId: string } | null>(null); const [text, setText] = useState(''); const [reduced, setReduced] = useState(true);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]); const visible = useRef(active); const compose = useRef<View>(null);
  useEffect(() => { visible.current = active; }, [active]);
  useEffect(() => {
    let mounted = true; const pending = timers.current; AccessibilityInfo.isReduceMotionEnabled().then(value => { if (mounted) setReduced(value); }).catch(() => undefined);
    const listener = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => { mounted = false; listener.remove(); pending.forEach(clearTimeout); Keyboard.dismiss(); };
  }, []);
  const thread = active?.petId === pet.id ? state.conversations[active.candidateId] : undefined;
  function open(c: Candidate) {
    if (!state.conversations[c.id] || c.species !== pet.species) return;
    dispatchMatch({ type: 'read', pet, candidate: c }); setActive({ petId: pet.id, candidateId: c.id }); setCelebration(null); setText('');
  }
  function choose(like: boolean) {
    if (!candidate || candidate.species !== pet.species || !state.participating) return; dispatchMatch({ type: like ? 'like' : 'pass', pet, candidate }); if (!like) setPassed(rows => [...rows, candidate]);
    if (like && candidate.mutual && !state.conversations[candidate.id]) { setCelebration({ petId: pet.id, candidate }); AccessibilityInfo.announceForAccessibility('Demo karşılıklı eşleşme: ' + pet.name + ' ve ' + candidate.name); }
  }
  function send() {
    if (!thread || !validMessage(text)) return; const snapshot = { id: pet.id, species: pet.species }; const c = thread.candidate;
    dispatchMatch({ type: 'send', pet: snapshot, candidate: c, text }); setText('');
    timers.current.push(setTimeout(() => dispatchMatch({ type: 'reply', pet: snapshot, candidate: c, text: c.reply, visible: visible.current?.petId === snapshot.id && visible.current?.candidateId === c.id }), 700));
  }
  return <MatchScreen section={section} onSection={setSection} onSettings={() => setSettings(true)}>
    {section === 'Keşfet' && !state.participating ? <View style={{ flex: 1, justifyContent: 'center', gap: 20, padding: 20 }}><Paw size={70} /><Label heading>Bir merhabaya hazır mısınız?</Label><Button label="Paylaşım tercihlerini aç" onPress={() => setSettings(true)} /></View> : null}
    {section === 'Keşfet' && state.participating ? candidate ? <SwipeCard key={pet.id + candidate.id} candidate={candidate} choose={choose} reduced={reduced} canUndo={passed.length > 0} undo={() => { const last = passed.at(-1); if (last) { dispatchMatch({ type: 'undo', pet, candidate: last }); setPassed(rows => rows.slice(0, -1)); } }} info={() => setInfo(true)} /> : <Card><Label>Adaylar bitti</Label><Button label="Geri al" secondary disabled={!passed.length} onPress={() => { const last = passed.at(-1); if (last) { dispatchMatch({ type: 'undo', pet, candidate: last }); setPassed(rows => rows.slice(0, -1)); } }} /><Button label="Baştan göster" secondary onPress={() => { dispatchMatch({ type: 'reset', pet }); setPassed([]); }} /><Button label="Demo keşfini sıfırla" secondary onPress={() => { dispatchMatch({ type: 'reset', pet }); setPassed([]); }} /></Card> : null}
    {section === 'Mesajlar' ? <Card><Label heading>Eşleşmeler / Mesajlar</Label>{Object.values(state.conversations).length ? Object.values(state.conversations).map(conv => <Pressable key={conv.candidate.id} accessibilityRole="button" accessibilityLabel={conv.candidate.name + ' demo konuşmasını aç' + (conv.unread ? ' · okunmamış' : '')} onPress={() => open(conv.candidate)} style={{ minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 8, borderRadius: 16, borderWidth: 1, borderColor: colors.border }}><Portrait candidate={conv.candidate} small /><View style={{ flex: 1 }}><Label>{conv.candidate.name}</Label><Text numberOfLines={1} style={{ color: colors.text }}>{conv.messages.at(-1)?.text}</Text></View>{conv.unread ? <Text accessibilityLabel="Okunmamış" style={{ color: colors.danger }}>●</Text> : null}</Pressable>) : <Note>Henüz eşleşme yok. Tek taraflı beğeni konuşma açmaz.</Note>}</Card> : null}
    <Modal visible={settings} onRequestClose={() => setSettings(false)}><Screen title="PatiMatch ayarları" tone="match"><Button label="Ayarları kapat" secondary onPress={() => setSettings(false)} /><PetSelector /><Card><Label>Paylaşım tercihleri</Label><Note>Kurgu profiller ve oturumluk mesajlar. Gerçek kişilerle bağlantı kurulmaz.</Note><Note>{reduced ? 'Azaltılmış hareket açık' : 'Sağa beğen · sola geç'}</Note><Button secondary label={state.participating ? 'Demo keşfine katılımı kapat' : 'Demo keşfine katıl'} onPress={() => { dispatchMatch({ type: 'toggle', pet }); setSettings(false); }} /></Card></Screen></Modal>
    <Modal visible={info} onRequestClose={() => setInfo(false)}><Screen title="Patini tanı" tone="match"><Button label="Bilgiyi kapat" secondary onPress={() => setInfo(false)} /><Label heading>{candidate?.name}</Label><Note>{candidate?.bio}</Note><Note>Mesafe ve profil bilgileri temsilidir; veteriner doğrulaması değildir.</Note></Screen></Modal>
    <Modal visible={celebration?.petId === pet.id} transparent animationType={reduced ? 'none' : 'fade'} onRequestClose={() => setCelebration(null)}><SafeAreaView style={{ flex: 1, justifyContent: 'center', padding: 24, backgroundColor: colors.background }}><View accessibilityViewIsModal><Card><View style={{ alignItems: 'center', gap: 12 }}><Text style={{ fontSize: 56 }}>{pet.species === 'Kedi' ? '🐱 💗 🐱' : '🐶 💗 🐶'}</Text><Text style={{ color: '#E11D48', fontSize: 22, fontWeight: '800', textAlign: 'center' }}>Karşılıklı demo eşleşme! 🎉</Text><Label>{pet.name} ve {celebration?.candidate.name}</Label></View><Note>Gerçek kullanıcı bağlantısı değil; kurgu karşılıklı beğeni.</Note><Button label="Mesaj gönder" onPress={() => { if (celebration) open(celebration.candidate); }} /><Button label="Keşfe devam et" secondary onPress={() => setCelebration(null)} /></Card></View></SafeAreaView></Modal>
    <Modal visible={!!thread} animationType={reduced ? 'none' : 'slide'} onRequestClose={() => { Keyboard.dismiss(); setActive(null); }}><SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}><View accessibilityViewIsModal style={{ flex: 1 }}><View style={{ padding: 18, gap: 12 }}><Button label="Konuşmayı kapat" secondary onPress={() => { Keyboard.dismiss(); setActive(null); }} />{thread ? <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}><Portrait candidate={thread.candidate} small /><Label heading>Demo sohbet · {thread.candidate.name}</Label></View> : null}</View><KeyboardScreen followEnd>{thread?.messages.map(message => <View key={message.id} style={{ alignSelf: message.from === 'me' ? 'flex-end' : 'flex-start', maxWidth: '85%', padding: 12, borderRadius: 18, borderBottomRightRadius: message.from === 'me' ? 4 : 18, borderBottomLeftRadius: message.from === 'me' ? 18 : 4, borderWidth: 1, borderColor: colors.border, backgroundColor: message.from === 'me' ? colors.greenSoft : colors.surface }}><Text style={{ color: colors.text, fontSize: 16 }}>{message.text}</Text></View>)}<Note>Otomatik yanıtlar demo; canlı kullanıcı yok.</Note><View ref={compose} style={{ gap: 12 }}><Field label="Demo mesaj" focusArea={compose} value={text} onChangeText={setText} maxLength={500} /><Button label="Demo mesajı gönder" disabled={!validMessage(text)} onPress={send} /></View></KeyboardScreen></View></SafeAreaView></Modal>
  </MatchScreen>;
}

