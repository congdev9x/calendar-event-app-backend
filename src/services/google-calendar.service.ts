import axios from "axios";
import dayjs from "dayjs";
import { prisma } from "../lib/prisma";

const GOOGLE_CALENDAR_API = "https://www.googleapis.com/calendar/v3";

export async function refreshAccessToken(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.googleRefreshToken) throw new Error("No refresh token found");

  const res = await axios.post(
    "https://oauth2.googleapis.com/token",
    new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID || "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
      grant_type: "refresh_token",
      refresh_token: user.googleRefreshToken,
    }),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );

  const { access_token, expires_in } = res.data;
  const expiresAt = dayjs().add(expires_in, "seconds").toDate();

  // Update user token in DB
  await prisma.user.update({
    where: { id: userId },
    data: {
      googleAccessToken: access_token,
      googleTokenExpiresAt: expiresAt,
    },
  });

  return access_token;
}

async function getValidAccessToken(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.googleAccessToken) throw new Error("Google access token missing");

  const now = new Date();
  if (!user.googleTokenExpiresAt || user.googleTokenExpiresAt < now) {
    return refreshAccessToken(userId);
  }

  return user.googleAccessToken;
}

export async function createGoogleCalendarEvent(userId: string, event: {
  title: string;
  description?: string;
  solarDate: string;
}) {
  const accessToken = await getValidAccessToken(userId);

  const res = await axios.post(
    `${GOOGLE_CALENDAR_API}/calendars/primary/events`,
    {
      summary: event.title,
      description: event.description || "",
      start: { date: event.solarDate },
      end: { date: event.solarDate }, // same day event
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );

  return res.data.id as string; // googleCalendarEventId
}

export async function updateGoogleCalendarEvent(userId: string, googleId: string, event: {
  title: string;
  description?: string;
  solarDate: string;
}) {
  const accessToken = await getValidAccessToken(userId);

  await axios.put(
    `${GOOGLE_CALENDAR_API}/calendars/primary/events/${googleId}`,
    {
      summary: event.title,
      description: event.description || "",
      start: { date: event.solarDate },
      end: { date: event.solarDate },
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }
  );
}

export async function deleteGoogleCalendarEvent(userId: string, googleId: string) {
  const accessToken = await getValidAccessToken(userId);

  await axios.delete(
    `${GOOGLE_CALENDAR_API}/calendars/primary/events/${googleId}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
}
