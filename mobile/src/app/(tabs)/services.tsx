import { Screen, Card, Label, Note, RouteButton } from '../../components/ui';
export default function Services() {
  return <Screen title="Hizmetler" tab tone="services"><Label heading>Birlikte yanlarındayız.</Label><Note>Bir yuva bulmasına ya da güvenle eve dönmesine yardımcı ol.</Note><RouteButton label="Sahiplendirme" href="/adoption" /><Card><Label heading>Nasıl yardımcı olalım?</Label>
    <RouteButton label="Kayıp / yaralı ilanları" href="/reports" />
    <RouteButton label="Acil veteriner" href="/emergency" />
  </Card></Screen>;
}
