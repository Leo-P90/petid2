export const PETID_KNOWLEDGE_BASE = {
  education: {
    principles: ['pozitif pekiştirme', 'kısa seans', 'gönüllü katılım', 'çevre düzeni'],
    prohibited: ['ceza', 'korkutma', 'fiziksel zorlama', 'acı veren ekipman']
  },
  catTraining: {
    focus: ['güven', 'seçim hakkı', 'kooperatif bakım', 'stres azaltma'],
    lessonIds: ['cat1', 'cat2', 'cat3', 'cat4', 'cat5', 'cat6', 'cat7', 'cat8']
  },
  dogTraining: {
    focus: ['pozitif pekiştirme', 'kademeli zorluk', 'güvenli çevre'],
    lessonIds: ['k1', 'k2', 'k3', 'k4', 'k5', 'k6', 'k7', 'k8', 'k9', 'k10', 'k11', 'k12']
  },
  healthSafety: {
    prohibited: ['teşhis koyma', 'ilaç veya doz üretme', 'veteriner kaydını değiştirme'],
    allowed: ['raporu sadeleştirme', 'kayıttaki ifadeleri açıklama', 'veterinere sorulacak başlıkları çıkarma'],
    redFlags: ['nefes darlığı', 'nöbet', 'zehirlenme', 'travma', 'idrar yapamama', 'kontrolsüz kanama']
  },
  aiAnswerSafety: {
    disclaimer: 'PETID AI bilgilendirme ve kayıt sadeleştirme desteğidir; veteriner muayenesinin yerini tutmaz.',
    prescriptionRule: 'Doz ve kullanım planı yalnızca veterinerin kayıt ettiği reçeteden gösterilir.'
  },
  veterinarianRouting: {
    routine: 'Takip notu oluştur ve bir sonraki rutin kontrolde veterinerle paylaş.',
    followUp: 'Belirti sürerse veya kötüleşirse veterinerle görüş.',
    urgent: 'Gecikmeden veteriner kliniğiyle iletişime geç.'
  }
};
