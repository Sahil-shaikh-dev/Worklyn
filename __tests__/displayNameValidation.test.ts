import {
  formatDisplayNameForHeader,
  getDisplayNameValidationError,
  isValidDisplayName,
} from '../src/features/userProfile/validateDisplayName';

describe('display name validation', () => {
  it('accepts trimmed length 3 or more with no upper bound', () => {
    expect(isValidDisplayName('  abc  ')).toBe(true);
    expect(isValidDisplayName('abcdefghijklmnop')).toBe(true);
    expect(getDisplayNameValidationError('abc')).toBeNull();
  });

  it('rejects too short after trim', () => {
    expect(isValidDisplayName('ab')).toBe(false);
    expect(isValidDisplayName('  xx  ')).toBe(false);
    expect(getDisplayNameValidationError('ab')).not.toBeNull();
  });
});

describe('formatDisplayNameForHeader', () => {
  it('title-cases words separated by whitespace', () => {
    expect(formatDisplayNameForHeader('  jOHN   doe  ')).toBe('John Doe');
    expect(formatDisplayNameForHeader('alex')).toBe('Alex');
  });
});
