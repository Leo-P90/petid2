import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Image, Keyboard, Modal, PanResponder, Pressable, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Card, Field, Label, Note, Screen, RouteButton, PetSelector, Segments, useSectionColors } from '../../components/ui';
import { KeyboardScreen } from '../../components/keyboard-screen';
import { discoverMatches, emptyMatch, validMessage, type Candidate } from '../../core/match-model';
import { exitDuration, swipeChoice } from '../../core/match-motion';
import { matchDemo } from '../../data/match-demo';
import { useApp } from '../../state/app-state';
function Portrait({ candidate, small = false }: { candidate: Candidate; small?: boolean }) {
  const colors = useSectionColors('match'); const [failed, setFailed] = useState(false);
  return <View style={{ height: small ? 48 : 245, width: small ? 48 : '100%', borderRadius: 24, overflow: 'hidden', backgroundColor: colors.greenSoft, justifyContent: 'center', alignItems: 'center' }}>
    {candidate.photo && !failed ? <Image accessibilityLabel={candidate.name + ' · demo fotoğraf'} source={{ uri: candidate.photo }} onError={() => setFailed(true)} style={{ height: '100%', width: '100%' }} resizeMode="cover" /> : <Text accessibilityLabel="Temsili aday tür avatarı" style={{ fontSize: small ? 26 : 110 }}>{candidate.species === 'Kedi' ? '🐱' : '🐶'}</Text>}
  </View>;
}
function SwipeCard({ candidate, choose, reduced }: { candidate: Candidate; choose: (like: boolean) => void; reduced: boolean }) {
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
  return <><Animated.View {...pan.panHandlers} testID="match-swipe-card" style={{ transform: [{ translateX: x }, { rotate: reduced ? '0deg' : x.interpolate({ inputRange: [-width, 0, width], outputRange: ['-14deg', '0deg', '14deg'] }) }] }}><Card>
    <View><Portrait candidate={candidate} /><View style={{ position: 'absolute', top: 12, left: 12, backgroundColor: colors.surface, borderRadius: 20, padding: 8 }}><Note>{candidate.species} · Örnek aday</Note></View></View>
    <Label heading>{candidate.name}</Label><Note>{candidate.age} · {candidate.breed} · {candidate.gender}</Note><Note>📍 {candidate.distance} · demo mesafe</Note><Label>{candidate.bio}</Label>
    <Note>Aynı tür arkadaşlar · Mesafe temsilidir</Note>
  </Card></Animated.View><View style={{ flexDirection: 'row', justifyContent: 'center', gap: 28 }}><Pressable accessibilityRole="button" accessibilityLabel="Geç" disabled={busy} onPress={() => commit(false)} style={{ width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface }}><Text style={{ fontSize: 28, color: colors.danger }}>×</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel="Beğen · demo" disabled={busy} onPress={() => commit(true)} style={{ width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E11D48' }}><Text style={{ fontSize: 27, color: '#FFFFFF' }}>♥</Text></Pressable></View></>;
}
export default function Match() { const { pet } = useApp(); return <MatchExperience key={pet.id} />; }
function MatchExperience() {
  const { pet, matches, dispatchMatch } = useApp(); const colors = useSectionColors('match'); const state = matches[pet.id] ?? emptyMatch(); const candidate = discoverMatches(pet, state, matchDemo)[0];
  const [section, setSection] = useState('Keşfet');
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
    if (!candidate || candidate.species !== pet.species) return; dispatchMatch({ type: like ? 'like' : 'pass', pet, candidate });
    if (like && candidate.mutual && !state.conversations[candidate.id]) { setCelebration({ petId: pet.id, candidate }); AccessibilityInfo.announceForAccessibility('Demo karşılıklı eşleşme: ' + pet.name + ' ve ' + candidate.name); }
  }
  function send() {
    if (!thread || !validMessage(text)) return; const snapshot = { id: pet.id, species: pet.species }; const c = thread.candidate;
    dispatchMatch({ type: 'send', pet: snapshot, candidate: c, text }); setText('');
    timers.current.push(setTimeout(() => dispatchMatch({ type: 'reply', pet: snapshot, candidate: c, text: c.reply, visible: visible.current?.petId === snapshot.id && visible.current?.candidateId === c.id }), 700));
  }
  return <Screen title="PatiMatch" tab tone="match"><PetSelector /><Segments labels={['Keşfet', 'Mesajlar']} selected={section} onSelect={setSection} /><Note>{pet.name} için aynı tür demo keşfi · Gerçek kullanıcı yok.</Note><Note>{reduced ? 'Azaltılmış hareket açık' : 'Sağa beğen · sola geç · düğmelerle de kullanabilirsin'}</Note>
    {section === 'Keşfet' ? <Button secondary label={state.participating ? 'Demo keşfine katılımı kapat' : 'Demo keşfine katıl'} onPress={() => dispatchMatch({ type: 'toggle', pet })} /> : null}
    {section === 'Keşfet' && state.participating ? candidate ? <SwipeCard key={pet.id + candidate.id} candidate={candidate} choose={choose} reduced={reduced} /> : <Card><Label>Adaylar bitti 🐾</Label><Button label="Baştan göster" secondary onPress={() => dispatchMatch({ type: 'reset', pet })} /><Button label="Demo keşfini sıfırla" secondary onPress={() => dispatchMatch({ type: 'reset', pet })} /></Card> : null}
    {state.likes.some(id => !state.conversations[id]) ? <Note>Tek taraflı demo beğeni kaydedildi. Karşılıklı eşleşme veya mesaj oluşturulmadı.</Note> : null}
    {section === 'Mesajlar' ? <Card><Label heading>Eşleşmeler / Mesajlar</Label>{Object.values(state.conversations).length ? Object.values(state.conversations).map(conv => <Pressable key={conv.candidate.id} accessibilityRole="button" accessibilityLabel={conv.candidate.name + ' demo konuşmasını aç' + (conv.unread ? ' · okunmamış' : '')} onPress={() => open(conv.candidate)} style={{ minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 8, borderRadius: 16, borderWidth: 1, borderColor: colors.border }}><Portrait candidate={conv.candidate} small /><View style={{ flex: 1 }}><Label>{conv.candidate.name}</Label><Text numberOfLines={1} style={{ color: colors.text }}>{conv.messages.at(-1)?.text}</Text></View>{conv.unread ? <Text accessibilityLabel="Okunmamış" style={{ color: colors.danger }}>●</Text> : null}</Pressable>) : <Note>Henüz eşleşme yok. Tek taraflı beğeni konuşma açmaz.</Note>}</Card> : null}
    <Card><Label>Gizlilik ve güvenlik</Label><Note>Kurgu, oturumluk demo. Engelleme, şikayet, moderasyon ve güvenli gerçek mesajlaşma sonraki backend kapısıdır. Sağlık rozetleri doğrulanmış kayıt değildir; sahip iletişimi paylaşılmaz.</Note><RouteButton label="Sahiplendirmeyi aç" href="/adoption" /></Card>
    <Modal visible={celebration?.petId === pet.id} transparent animationType={reduced ? 'none' : 'fade'} onRequestClose={() => setCelebration(null)}><SafeAreaView style={{ flex: 1, justifyContent: 'center', padding: 24, backgroundColor: colors.background }}><View accessibilityViewIsModal><Card><View style={{ alignItems: 'center', gap: 12 }}><Text style={{ fontSize: 56 }}>{pet.species === 'Kedi' ? '🐱 💗 🐱' : '🐶 💗 🐶'}</Text><Text style={{ color: '#E11D48', fontSize: 22, fontWeight: '800', textAlign: 'center' }}>Karşılıklı demo eşleşme! 🎉</Text><Label>{pet.name} ve {celebration?.candidate.name}</Label></View><Note>Gerçek kullanıcı bağlantısı değil; kurgu karşılıklı beğeni.</Note><Button label="Mesaj gönder" onPress={() => { if (celebration) open(celebration.candidate); }} /><Button label="Keşfe devam et" secondary onPress={() => setCelebration(null)} /></Card></View></SafeAreaView></Modal>
    <Modal visible={!!thread} animationType={reduced ? 'none' : 'slide'} onRequestClose={() => { Keyboard.dismiss(); setActive(null); }}><SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}><View accessibilityViewIsModal style={{ flex: 1 }}><View style={{ padding: 18, gap: 12 }}><Button label="Konuşmayı kapat" secondary onPress={() => { Keyboard.dismiss(); setActive(null); }} />{thread ? <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}><Portrait candidate={thread.candidate} small /><Label heading>Demo sohbet · {thread.candidate.name}</Label></View> : null}</View><KeyboardScreen followEnd>{thread?.messages.map(message => <View key={message.id} style={{ alignSelf: message.from === 'me' ? 'flex-end' : 'flex-start', maxWidth: '85%', padding: 12, borderRadius: 18, borderBottomRightRadius: message.from === 'me' ? 4 : 18, borderBottomLeftRadius: message.from === 'me' ? 18 : 4, borderWidth: 1, borderColor: colors.border, backgroundColor: message.from === 'me' ? colors.greenSoft : colors.surface }}><Text style={{ color: colors.text, fontSize: 16 }}>{message.text}</Text></View>)}<Note>Otomatik yanıtlar demo; canlı kullanıcı yok.</Note><View ref={compose} style={{ gap: 12 }}><Field label="Demo mesaj" focusArea={compose} value={text} onChangeText={setText} maxLength={500} /><Button label="Demo mesajı gönder" disabled={!validMessage(text)} onPress={send} /></View></KeyboardScreen></View></SafeAreaView></Modal>
  </Screen>;
}

