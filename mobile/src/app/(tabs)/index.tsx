import { Screen, Card, Label, Note, RouteButton } from '../../components/ui';
import { useApp } from '../../state/app-state';
export default function Home() {
  const { pet } = useApp();
  return <Screen title="Dostunun dünyası, bir arada" tab>
    <Card><Label heading>{pet.name}</Label><Note>{pet.species} · {pet.age}</Note><RouteButton label="Profili ve dijital kimliği aç" href="/profile" /></Card>
    <Card><Label heading>Bugün neye ihtiyacın var?</Label>
      <RouteButton label="Sağlık geçmişi" href="/health" />
      <RouteButton label="Kayıp veya yaralı hayvan" href="/reports" />
      <RouteButton label="Acil veteriner" href="/emergency" />
      <RouteButton label="PatiMatch keşfi" href="/match" />
      <RouteButton label="Sahiplendirme ilanları" href="/adoption" />
    </Card>
  </Screen>;
}
