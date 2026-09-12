import { createServices, resultMessage, type NativePorts } from '../src/core/services';
function ports(): NativePorts {
  return {
    photoPermission: jest.fn(async () => ({ granted: true, canAskAgain: true })),
    photoPicker: jest.fn(async () => ({ canceled: false, uris: ['file:///photo.jpg'] })),
    locationPermission: jest.fn(async () => ({ granted: true, canAskAgain: true })),
    locate: jest.fn(async () => ({ latitude: 41, longitude: 29 })),
    filePicker: jest.fn(async () => ({ canceled: false, files: [{ uri: 'file:///health.pdf', name: 'health.pdf', size: 100 }] })),
    openURL: jest.fn(async () => undefined),
  };
}
test('photo success and cancellation are distinct', async () => {
  const p = ports(); const service = createServices(p);
  expect(await service.pickPhotos()).toEqual({ status: 'success', value: ['file:///photo.jpg'] });
  p.photoPicker = jest.fn(async () => ({ canceled: true, uris: [] }));
  expect(await service.pickPhotos()).toEqual({ status: 'canceled' });
});
test.each([true, false])('photo denial is visible, canAskAgain=%s', async (canAskAgain) => {
  const p = ports(); p.photoPermission = jest.fn(async () => ({ granted: false, canAskAgain }));
  const result = await createServices(p).pickPhotos();
  expect(result).toEqual({ status: 'denied', canAskAgain });
  expect(p.photoPicker).not.toHaveBeenCalled();
  expect(resultMessage(result)).toContain(canAskAgain ? 'İzin verilmedi' : 'Cihaz ayarlarından');
});
test('photo native failure is visible', async () => {
  const p = ports(); p.photoPicker = jest.fn(async () => { throw new Error('native'); });
  expect((await createServices(p).pickPhotos()).status).toBe('error');
});
test('location success and foreground permission denial', async () => {
  const p = ports(); const service = createServices(p);
  expect(await service.locate()).toEqual({ status: 'success', value: { latitude: 41, longitude: 29 } });
  p.locationPermission = jest.fn(async () => ({ granted: false, canAskAgain: false }));
  expect((await service.locate()).status).toBe('denied');
  expect(p.locate).toHaveBeenCalledTimes(1);
});
test('location failure and invalid native coordinates never become success', async () => {
  const p = ports(); p.locate = jest.fn(async () => ({ latitude: 999, longitude: 29 }));
  expect((await createServices(p).locate()).status).toBe('error');
  p.locate = jest.fn(async () => { throw new Error('offline'); });
  expect(resultMessage(await createServices(p).locate())).toContain('GPS');
});
test('file success, cancellation, oversized file and failure', async () => {
  const p = ports(); const service = createServices(p);
  expect((await service.pickFile()).status).toBe('success');
  p.filePicker = jest.fn(async () => ({ canceled: true, files: [] }));
  expect((await service.pickFile()).status).toBe('canceled');
  p.filePicker = jest.fn(async () => ({ canceled: false, files: [{ uri: 'f', name: 'large.pdf', size: 11 * 1024 * 1024 }] }));
  expect((await service.pickFile()).status).toBe('error');
  p.filePicker = jest.fn(async () => { throw new Error('denied'); });
  expect((await service.pickFile()).status).toBe('error');
});
test('external links validate numbers and never include arbitrary URLs', async () => {
  const p = ports(); const service = createServices(p);
  expect((await service.contact('tel', '+90 (555) 123-45-67')).status).toBe('success');
  expect(p.openURL).toHaveBeenLastCalledWith('tel:+905551234567');
  await service.contact('whatsapp', '+905551234567');
  expect(p.openURL).toHaveBeenLastCalledWith('https://wa.me/905551234567');
  expect((await service.contact('tel', 'javascript:alert(1)')).status).toBe('error');
  expect(p.openURL).toHaveBeenCalledTimes(2);
  p.openURL = jest.fn(async () => { throw new Error('no handler'); });
  expect((await service.contact('tel', '+905551234567')).status).toBe('error');
});
