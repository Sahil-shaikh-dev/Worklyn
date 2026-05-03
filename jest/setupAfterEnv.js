/* eslint-env jest */
const mockAsyncStorageStore = new Map();

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn((key, value) => {
    mockAsyncStorageStore.set(key, value);
    return Promise.resolve();
  }),
  getItem: jest.fn(key =>
    Promise.resolve(mockAsyncStorageStore.get(key) ?? null),
  ),
  removeItem: jest.fn(key => {
    mockAsyncStorageStore.delete(key);
    return Promise.resolve();
  }),
  clear: jest.fn(() => {
    mockAsyncStorageStore.clear();
    return Promise.resolve();
  }),
  getAllKeys: jest.fn(() =>
    Promise.resolve(Array.from(mockAsyncStorageStore.keys())),
  ),
  multiGet: jest.fn(keys =>
    Promise.resolve(keys.map(k => [k, mockAsyncStorageStore.get(k) ?? null])),
  ),
  multiSet: jest.fn(pairs => {
    for (const [k, v] of pairs) {
      mockAsyncStorageStore.set(k, v);
    }
    return Promise.resolve();
  }),
}));
