import * as Linking from 'expo-linking';
import type { Session, SupabaseClient } from '@supabase/supabase-js';

export type AuthAdapter = ReturnType<typeof createAuthAdapter>;
export function createAuthAdapter(client: SupabaseClient | null) {
  return {
    configured: Boolean(client),
    async session() { if (!client) return null; const { data, error } = await client.auth.getSession(); if (error) throw error; return data.session; },
    listen(callback: (session: Session | null) => void) {
      if (!client) return () => undefined;
      const { data } = client.auth.onAuthStateChange((_event, session) => callback(session));
      return () => data.subscription.unsubscribe();
    },
    async signIn(email: string, password: string) { if (!client) throw new Error('unconfigured'); const { error } = await client.auth.signInWithPassword({ email, password }); if (error) throw error; },
    async signUp(email: string, password: string) { if (!client) throw new Error('unconfigured'); const { error } = await client.auth.signUp({ email, password }); if (error) throw error; },
    async signOut() { if (!client) return; const { error } = await client.auth.signOut(); if (error) throw error; },
    async recover(email: string) { if (!client) throw new Error('unconfigured'); const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo: Linking.createURL('/reset-password') }); if (error) throw error; },
    async exchangeRecoveryUrl(value: string) {
      if (!client) throw new Error('unconfigured');
      const code = Linking.parse(value).queryParams?.code;
      if (typeof code !== 'string') throw new Error('invalid recovery link');
      const { error } = await client.auth.exchangeCodeForSession(code); if (error) throw error;
    },
    async updatePassword(password: string) { if (!client) throw new Error('unconfigured'); const { error } = await client.auth.updateUser({ password }); if (error) throw error; },
  };
}

