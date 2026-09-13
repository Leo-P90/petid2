import { useState } from 'react';
import { Button, Card, Field, Note, Screen } from '../components/ui';
import { useAuth } from '../state/auth-state';
export default function ResetPassword() {
  const auth = useAuth(); const [password, setPassword] = useState('');
  return <Screen title="Yeni parola"><Card><Field label="Yeni parola" value={password} onChangeText={setPassword} secureTextEntry />
    <Button label="Parolayı güncelle" disabled={auth.busy || password.length < 8} onPress={() => void auth.updatePassword(password)} />{auth.message ? <Note>{auth.message}</Note> : null}</Card></Screen>;
}
