import { describe, expect, test } from 'vitest';
import { getVietnamMonthRange } from '@/lib/finance';

describe('getVietnamMonthRange — múi giờ UTC+7', () => {
  test('tháng 11 theo giờ Việt Nam', () => {
    expect(getVietnamMonthRange(new Date('2026-11-20T09:00:00Z'))).toEqual({
      gte: new Date('2026-10-31T17:00:00.000Z'),
      lt: new Date('2026-11-30T17:00:00.000Z'),
    });
  });
  test('đúng khi UTC vẫn còn ở tháng trước', () => {
    expect(getVietnamMonthRange(new Date('2026-10-31T18:00:00Z'))).toEqual({
      gte: new Date('2026-10-31T17:00:00.000Z'),
      lt: new Date('2026-11-30T17:00:00.000Z'),
    });
  });
  test('lùi về tháng 12 năm trước khi ở tháng 1', () => {
    expect(getVietnamMonthRange(new Date('2027-01-12T08:00:00Z'), -1)).toEqual({
      gte: new Date('2026-11-30T17:00:00.000Z'),
      lt: new Date('2026-12-31T17:00:00.000Z'),
    });
  });
});
