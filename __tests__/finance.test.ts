import { describe, expect, test } from 'vitest';
import { wishlistProgress } from '@/lib/finance';

describe('wishlistProgress — kế thừa tuần 9', () => {
  test('tính % và làm tròn xuống', () => {
    expect(wishlistProgress(2_999_999, 4_000_000)).toBe(74);
  });
  test('phần trăm luôn nằm trong khoảng 0–100', () => {
    expect(wishlistProgress(-500_000, 1_000_000)).toBe(0);
    expect(wishlistProgress(9_000_000, 1_000_000)).toBe(100);
  });
  test('giá không hợp lệ không gây chia cho 0', () => {
    expect(wishlistProgress(100_000, 0)).toBe(0);
  });
});
