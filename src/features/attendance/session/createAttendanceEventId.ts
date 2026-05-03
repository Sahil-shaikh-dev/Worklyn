type CryptoWithRandomUuid = { randomUUID?: () => string };

const globalForUuid = globalThis as typeof globalThis & {
  crypto?: CryptoWithRandomUuid;
};

export function createAttendanceEventId(): string {
  const cryptoObj = globalForUuid.crypto;
  if (
    cryptoObj != null &&
    typeof cryptoObj.randomUUID === 'function'
  ) {
    return cryptoObj.randomUUID();
  }
  return `att-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
