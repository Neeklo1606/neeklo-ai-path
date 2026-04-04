import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const count = await db.media.count();
console.log("MEDIA COUNT:", count);
await db.$disconnect();
