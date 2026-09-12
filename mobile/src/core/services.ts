import { validCoordinates } from './model';
export type Result<T> =
  | { status: 'success'; value: T }
  | { status: 'canceled' }
  | { status: 'denied'; canAskAgain: boolean }
  | { status: 'error'; message: string };
export type Permission = { granted: boolean; canAskAgain: boolean };
export type Coordinates = { latitude: number; longitude: number };
export type SelectedFile = { uri: string; name: string; mimeType?: string; size?: number };
export type NativePorts = {
  photoPermission: () => Promise<Permission>;
  photoPicker: () => Promise<{ canceled: boolean; uris: string[] }>;
  locationPermission: () => Promise<Permission>;
  locate: () => Promise<Coordinates>;
  filePicker: () => Promise<{ canceled: boolean; files: SelectedFile[] }>;
  openURL: (url: string) => Promise<unknown>;
};
export function createServices(ports: NativePorts) {
  return {
    async pickPhotos(): Promise<Result<string[]>> {
      try {
        const permission = await ports.photoPermission();
        if (!permission.granted) return { status: 'denied', canAskAgain: permission.canAskAgain };
        const result = await ports.photoPicker();
        return result.canceled ? { status: 'canceled' } : { status: 'success', value: result.uris };
      } catch { return { status: 'error', message: 'Fotoğraf seçilemedi. Yeniden deneyin.' }; }
    },
    async locate(): Promise<Result<Coordinates>> {
      try {
        const permission = await ports.locationPermission();
        if (!permission.granted) return { status: 'denied', canAskAgain: permission.canAskAgain };
        const value = await ports.locate();
        if (!validCoordinates(value.latitude, value.longitude)) throw new Error('Invalid position');
        return { status: 'success', value };
      } catch { return { status: 'error', message: 'Konum alınamadı. GPS ve bağlantıyı kontrol edin; koordinatları elle girebilirsiniz.' }; }
    },
    async pickFile(): Promise<Result<SelectedFile>> {
      try {
        const result = await ports.filePicker();
        if (result.canceled || !result.files[0]) return { status: 'canceled' };
        const file = result.files[0];
        if ((file.size ?? 0) > 10 * 1024 * 1024) return { status: 'error', message: 'Dosya en fazla 10 MB olabilir.' };
        return { status: 'success', value: file };
      } catch { return { status: 'error', message: 'Dosya seçilemedi. Dosya erişimini kontrol edin.' }; }
    },
    async contact(kind: 'tel' | 'whatsapp', number: string): Promise<Result<null>> {
      const digits = number.replace(/[ +()-]/g, '');
      if (!/^\d{10,15}$/.test(digits)) return { status: 'error', message: 'Geçerli, ülke kodlu telefon numarası girin.' };
      try {
        await ports.openURL(kind === 'tel' ? 'tel:+' + digits : 'https://wa.me/' + digits);
        return { status: 'success', value: null };
      } catch { return { status: 'error', message: 'Bağlantı açılamadı. Uygulama veya ağ erişimini kontrol edin.' }; }
    },
  };
}
export function resultMessage<T>(result: Result<T>) {
  switch (result.status) {
    case 'success': return 'İşlem tamamlandı.';
    case 'canceled': return 'Seçim iptal edildi; hiçbir şey değişmedi.';
    case 'denied': return result.canAskAgain
      ? 'İzin verilmedi. İşlemi tekrar başlatarak izin verebilirsiniz.'
      : 'İzin kapalı. Cihaz ayarlarından PetID iznini açabilirsiniz.';
    case 'error': return result.message;
  }
}
