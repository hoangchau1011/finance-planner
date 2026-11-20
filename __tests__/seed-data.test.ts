import { describe, expect, test } from 'vitest';
import { ROWS, WISHLIST } from '@/prisma/seed-data';

describe('Seed fp1', () => {
  test('có tối thiểu 30 giao dịch và 3 wishlist', () => {
    expect(ROWS.length).toBeGreaterThanOrEqual(30);
    expect(WISHLIST).toHaveLength(3);
  });

  test('các khoản tiền nguyên dương, dùng đủ 8 danh mục', () => {
    for (const row of ROWS) {
      expect(Number.isSafeInteger(row.amount)).toBe(true);
      expect(row.amount).toBeGreaterThan(0);
      expect(row.description.length).toBeGreaterThan(0);
    }
    expect(new Set(ROWS.map((row) => row.category)).size).toBe(8);
  });
});
