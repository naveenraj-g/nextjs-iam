import { headers } from "next/headers";
import { auth } from "@/modules/server/auth-provider/auth";
import { prisma } from "../../../../../../../prisma/db";
import { ISessionsService } from "../../domain/interfaces/sessions.service.interface";
import {
  GetAllSessionsResponseDtoSchema,
  TGetAllSessionsResponseDtoSchema,
  TRevokeSessionValidationSchema,
} from "@/modules/entities/schemas/admin/sessions/sessions.schema";

export class SessionsService implements ISessionsService {
  async getAllSessions(): Promise<TGetAllSessionsResponseDtoSchema> {
    try {
      const sessions = await prisma.session.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
      return await GetAllSessionsResponseDtoSchema.parseAsync({ sessions });
    } catch (error) {
      throw error;
    }
  }

  async revokeUserSession(payload: TRevokeSessionValidationSchema): Promise<{ success: boolean }> {
    try {
      const res = await auth.api.revokeUserSession({
        body: { sessionToken: payload.sessionToken },
        headers: await headers(),
      });
      return { success: res.success };
    } catch (error) {
      throw error;
    }
  }

  async revokeAllSessions(): Promise<{ success: boolean; count: number }> {
    try {
      const result = await prisma.session.deleteMany({});
      return { success: true, count: result.count };
    } catch (error) {
      throw error;
    }
  }
}
