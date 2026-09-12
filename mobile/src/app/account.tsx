import { router } from 'expo-router';
import { Button, Card, Note, Screen } from '../components/ui';
import { useAuth } from '../state/auth-state';
export default function Account() {
  const auth = useAuth();
  return <Screen title="Hesap"><Card><Note>{auth.session?.user.email ?? 'Demo modu'}</Note>
    {auth.status === 'signedIn' && !auth.demo ? <Button label="Çıkış yap" disabled={auth.busy} onPress={() => void auth.signOut()} /> : <Button label="Hesap moduna geç" onPress={() => { auth.useAccount(); router.replace('/'); }} />}
    {auth.message ? <Note>{auth.message}</Note> : null}</Card></Screen>;
}
