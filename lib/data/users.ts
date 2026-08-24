import { prisma } from "@/lib/prisma";

export async function getAdminUsers() {
  return prisma.user.findMany({
    orderBy: [{ role: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      role: true,
      createdAt: true,
      _count: { select: { products: true } },
    },
  });
}

export async function getAdminUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      role: true,
      createdAt: true,
    },
  });
}
