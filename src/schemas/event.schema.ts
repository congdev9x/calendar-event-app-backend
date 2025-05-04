import { z } from 'zod';

export const eventSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  solarDate: z.string().datetime(), // ISO String
  lunarDate: z.string().nullable().optional(), // ISO String nếu có
  isLunar: z.boolean(),
  reminderMinutesBefore: z.number().int().default(0),
  googleCalendarEventId: z.string().nullable().optional(),
});
