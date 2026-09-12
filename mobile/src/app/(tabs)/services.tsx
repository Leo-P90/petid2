import { Screen, Card, Label, RouteButton } from '../../components/ui';
export default function Services() {
  return <Screen title="Hizmetler" tab><Card><Label heading>Bir dosta yardım et</Label>
    <RouteButton label="Kayıp / yaralı ilanları" href="/reports" />
    <RouteButton label="Acil veteriner" href="/emergency" />
    <RouteButton label="Sahiplendirme" href="/adoption" />
  </Card></Screen>;
}
