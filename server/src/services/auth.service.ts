import bcrypt from "bcryptjs";

import { AppError } from "../middleware/error-handler";
import { prisma } from "../lib/prisma";
import type { SignupInput } from "../validators/auth";

const SALT_ROUNDS = 10;

export async function signupStudent(input: SignupInput) {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });

  if (existing) {
    throw new AppError(409, "An account with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      password: hashedPassword,
      role: "STUDENT",
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  return user;
}
