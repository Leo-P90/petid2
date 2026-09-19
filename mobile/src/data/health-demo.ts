import type { HealthRecord } from '../core/health';
// The fixture is shown only in local demo mode and every overview marks it as an example.
const row = (id:string,kind:HealthRecord['kind'],title:string,occurred_on:string,due_on:string|null):HealthRecord => ({ id, owner_id:'demo', pet_id:'demo', kind, title, occurred_on, due_on, notes:'Örnek hatırlatma', weight_kg:null, created_at:occurred_on, updated_at:occurred_on });
export const healthDemo: HealthRecord[] = [
  row('demo-vaccine','vaccine','Karma Aşı (örnek)','2026-02-12','2026-10-15'),
  row('demo-parasite','medication','Parazit koruması (örnek)','2026-08-03',null),
  row('demo-exam','exam','Genel kontrol (örnek)','2026-06-18',null),
  row('demo-dental','exam','Diş ve ağız kontrolü (örnek)','2026-05-10',null),
];
