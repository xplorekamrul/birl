"use server";

import { prisma } from "@/lib/prisma";
import { actionClient } from "@/lib/safe-action/clients";
import { registerSchema } from "@/lib/validations/auth";
import { hashPassword } from "@/lib/hash";
import { Role } from "@prisma/client";

export const registerUser = actionClient
  .schema(registerSchema)
  .action(async ({ parsedInput }) => {
    const { name, email, password } = parsedInput;

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return { ok: false as const, message: "Email already registered" };
    }

    const role: Role = Role.USER;

    const pwd = await hashPassword(password);

    const user = await prisma.user.create({
      data: { name, email, password: pwd, role },
      select: { id: true, email: true, role: true, name: true },
    });

    return { ok: true as const, user };
  });
