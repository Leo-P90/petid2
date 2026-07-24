import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { CAT_LESSONS } from '../src/data/cat-lessons.js';
import { LESSONS } from '../src/data/lessons.js';
import { PETID_KNOWLEDGE_BASE } from '../src/data/knowledge-base.js';

test('kedi müfredatı sekiz güven temelli ders içerir', () => {
  assert.deepEqual(
    Object.values(CAT_LESSONS).map(lesson => lesson.title),
    [
      'İsmini Öğrenme',
      'Taşıma Çantasına Alışma',
      'Kum Kabı Düzeni',
      'Tırmalama Tahtası Kullanma',
      'Tırnak Kesimine Alışma',
      'Eve / Yeni İnsana Alışma',
      'Gece Aktivitesi Yönetimi',
      'Stres Azaltma'
    ]
  );
  for (const lesson of Object.values(CAT_LESSONS)) {
    assert.ok(lesson.steps.length >= 4);
    assert.ok(lesson.environment.length > 20);
    assert.ok(lesson.avoid.length > 20);
  }
  const curriculum = JSON.stringify(CAT_LESSONS);
  assert.match(curriculum, /güven/i);
  assert.match(curriculum, /gönüllü/i);
  assert.match(curriculum, /çevre/i);
  assert.match(curriculum, /stres/i);
});

test('köpek müfredatının 12 kademesi korunur', () => {
  for (let level = 1; level <= 12; level += 1) {
    assert.ok(LESSONS[`k${level}`], `k${level} dersi eksik`);
  }
  assert.equal(PETID_KNOWLEDGE_BASE.dogTraining.lessonIds.length, 12);
});

test('AI güvenlik tabanı teşhis ve doz üretimini engeller', () => {
  const prohibited = PETID_KNOWLEDGE_BASE.healthSafety.prohibited.join(' ');
  assert.match(prohibited, /teşhis/);
  assert.match(prohibited, /doz/);
  assert.match(PETID_KNOWLEDGE_BASE.education.prohibited.join(' '), /ceza|korkutma/);
});

test('sağlık ve veteriner prototipi uygulama kabuğuna bağlıdır', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  for (const marker of [
    'id="careTracking"',
    'id="vetRecords"',
    'id="labImaging"',
    'id="aiHealthSummary"',
    'id="healthTimeline"',
    'id="prescriptionModule"',
    'id="vetPanelModal"',
    '/src/premium-upgrade.js'
  ]) {
    assert.ok(html.includes(marker), `${marker} bulunamadı`);
  }
  assert.ok(!html.includes('Sağlık Skoru'));
  assert.ok(!html.includes('92 Skor'));
});
