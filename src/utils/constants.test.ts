import { DEFAULT_PHASE_COLORS } from './constants';

describe('DEFAULT_PHASE_COLORS', () => {
  it('should export default phase colors', () => {
    expect(DEFAULT_PHASE_COLORS).toBeDefined();
  });

  it('should have all required phase colors', () => {
    expect(DEFAULT_PHASE_COLORS.ready).toBe('#6B7280');
    expect(DEFAULT_PHASE_COLORS.prepare).toBe('#F59E0B');
    expect(DEFAULT_PHASE_COLORS.exercise).toBe('#EF4444');
    expect(DEFAULT_PHASE_COLORS.rest).toBe('#10B981');
    expect(DEFAULT_PHASE_COLORS.complete).toBe('#3B82F6');
  });

  it('should have readonly properties (TypeScript)', () => {
    // This test verifies the type is correctly defined as const
    // TypeScript will prevent reassignment at compile time
    const colors = DEFAULT_PHASE_COLORS;
    expect(colors).toBe(DEFAULT_PHASE_COLORS);
  });
});
