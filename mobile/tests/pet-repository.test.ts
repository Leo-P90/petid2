import { createPetRepository, PetMutationError } from '../src/services/pets';

function zeroRowClient() {
  type Chain = { data: null; error: null; update: () => Chain; delete: () => Chain; eq: () => Chain; select: () => Chain; maybeSingle: () => Promise<{ data: null; error: null }> };
  const chain: Chain = {
    data: null, error: null,
    update: jest.fn(() => chain), delete: jest.fn(() => chain),
    eq: jest.fn(() => chain), select: jest.fn(() => chain),
    maybeSingle: jest.fn(async () => ({ data: null, error: null })),
  };
  const bucket = { remove: jest.fn(async () => ({ data: [], error: null })) };
  return { from: jest.fn(() => chain), storage: { from: jest.fn(() => bucket) } };
}

test.each(['update', 'remove', 'removePhoto'] as const)('%s rejects a mock RLS zero-row response', async (operation) => {
  const repository = createPetRepository(zeroRowClient() as never);
  const promise = operation === 'update' ? repository.update('stale-id', { name: 'Changed' })
    : operation === 'remove' ? repository.remove('stale-id') : repository.removePhoto('missing.jpg');
  await expect(promise).rejects.toBeInstanceOf(PetMutationError);
});

test('list hydrates a database null age as an empty string', async () => {
  const client = { from: () => ({ select: () => ({ order: async () => ({
    data: [{ id: 'own-id', name: 'Mavi', species: 'Kedi', age_label: null }], error: null,
  }) }) }) };
  const pets = await createPetRepository(client as never).list();
  expect(pets[0].age).toBe('');
});
