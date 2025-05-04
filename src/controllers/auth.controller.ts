import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma";
import { signToken } from "../lib/utils/jwt";

export const register = async (req: Request, res: Response) => {
  const { email, password, name } = req.body;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(400).json({ message: "Email đã tồn tại" });

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, name, password: hashed },
  });

  return res.status(201).json({ user });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.password) {
    return res.status(401).json({ message: "Sai thông tin đăng nhập" });
  }

  const valid = bcrypt.compare(password, user.password);
  if (!valid)
    return res.status(401).json({ message: "Sai thông tin đăng nhập" });

  const token = signToken({ id: user.id, email: user.email });
  return res.json({ token });
};
