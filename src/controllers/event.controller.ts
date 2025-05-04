import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { eventSchema } from "../schemas/event.schema";

// GET all events
export async function getEvents(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = (req as any).user?.id; // 👈 lấy user từ token
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const events = await prisma.event.findMany({
      where: { userId },
      orderBy: { solarDate: "asc" },
      include: { user: { select: { email: true, name: true } } },
    });
    res.json(events);
  } catch (error) {
    next(error);
  }
}

// POST create event
export async function createEvent(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const parsed = eventSchema.safeParse(req.body);
  const userId = (req as any).user?.id; // 👈 lấy user từ token middleware
  if (!parsed.success) {
    return res.status(400).json(parsed.error);
  }

  const data = parsed.data;

  try {
    const newEvent = await prisma.event.create({
      data: {
        title: data.title,
        description: data.description || "",
        solarDate: new Date(data.solarDate),
        lunarDate: data.lunarDate ? data.lunarDate : null,
        isLunar: data.isLunar,
        reminderMinutesBefore: data.reminderMinutesBefore || 0,
        googleCalendarEventId: data.googleCalendarEventId || null,
        userId, // 👈 gắn userId tại đây
      },
    });

    res.status(201).json(newEvent);
  } catch (error) {
    next(error);
  }
}

// PUT update event
export async function updateEvent(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { id } = req.params;
  const userId = (req as any).user?.id;

  const event = await prisma.event.findUnique({ where: { id, userId } });

  if (!event || event.userId !== userId) {
    return res
      .status(403)
      .json({ message: "Không có quyền chỉnh sửa sự kiện này" });
  }
  const parsed = eventSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json(parsed.error);
  }

  const data = parsed.data;

  try {
    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description || "",
        solarDate: new Date(data.solarDate),
        lunarDate: data.lunarDate ? data.lunarDate : null,
        isLunar: data.isLunar,
        reminderMinutesBefore: data.reminderMinutesBefore || 0,
        googleCalendarEventId: data.googleCalendarEventId || null,
      },
    });

    res.json(updatedEvent);
  } catch (error) {
    next(error);
  }
}

// DELETE event
export async function deleteEvent(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { id } = req.params;
  const userId = (req as any).user?.id;
  const event = await prisma.event.findUnique({ where: { id, userId } });

  if (!event || event.userId !== userId) {
    return res.status(403).json({ message: "Không có quyền xoá sự kiện này" });
  }

  try {
    await prisma.event.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
