import { headers } from "next/headers";
import { auth } from "@/modules/server/auth-provider/auth";
import { IUsersService } from "../../domain/interfaces/users.service.interface";
import {
  GetUsersResponseDtoSchema,
  TGetUsersResponseDtoSchema,
  UserSchema,
  TUserSchema,
  TCreateUserValidationSchema,
  TUpdateUserValidationSchema,
  TSetUserRoleValidationSchema,
  TBanUserValidationSchema,
  TSetUserPasswordValidationSchema,
} from "@/modules/entities/schemas/admin/users/users.schema";

export class UsersService implements IUsersService {
  async getUsers(): Promise<TGetUsersResponseDtoSchema> {
    try {
      const res = await auth.api.listUsers({
        query: {},
        headers: await headers(),
      });
      return await GetUsersResponseDtoSchema.parseAsync(res);
    } catch (error) {
      throw error;
    }
  }

  async createUser(payload: TCreateUserValidationSchema): Promise<TUserSchema> {
    try {
      const res = await auth.api.createUser({
        body: {
          name: payload.name,
          email: payload.email,
          password: payload.password,
          role: payload.role,
        },
        headers: await headers(),
      });
      return await UserSchema.parseAsync(res.user);
    } catch (error) {
      throw error;
    }
  }

  async updateUser(payload: TUpdateUserValidationSchema): Promise<TUserSchema> {
    try {
      const res = await auth.api.adminUpdateUser({
        body: { userId: payload.userId, data: payload.data },
        headers: await headers(),
      });
      return await UserSchema.parseAsync(res);
    } catch (error) {
      throw error;
    }
  }

  async setUserRole(payload: TSetUserRoleValidationSchema): Promise<TUserSchema> {
    try {
      const res = await auth.api.setRole({
        body: { userId: payload.userId, role: payload.role },
        headers: await headers(),
      });
      return await UserSchema.parseAsync(res.user);
    } catch (error) {
      throw error;
    }
  }

  async banUser(payload: TBanUserValidationSchema): Promise<TUserSchema> {
    try {
      const res = await auth.api.banUser({
        body: {
          userId: payload.userId,
          banReason: payload.banReason,
          banExpiresIn: payload.banExpiresIn,
        },
        headers: await headers(),
      });
      return await UserSchema.parseAsync(res.user);
    } catch (error) {
      throw error;
    }
  }

  async unbanUser(payload: { userId: string }): Promise<TUserSchema> {
    try {
      const res = await auth.api.unbanUser({
        body: { userId: payload.userId },
        headers: await headers(),
      });
      return await UserSchema.parseAsync(res.user);
    } catch (error) {
      throw error;
    }
  }

  async removeUser(payload: { userId: string }): Promise<{ success: boolean }> {
    try {
      const res = await auth.api.removeUser({
        body: { userId: payload.userId },
        headers: await headers(),
      });
      return { success: res.success };
    } catch (error) {
      throw error;
    }
  }

  async setUserPassword(payload: TSetUserPasswordValidationSchema): Promise<{ status: boolean }> {
    try {
      const res = await auth.api.setUserPassword({
        body: { userId: payload.userId, newPassword: payload.newPassword },
        headers: await headers(),
      });
      return { status: res.status };
    } catch (error) {
      throw error;
    }
  }

  async revokeUserSessions(payload: { userId: string }): Promise<{ success: boolean }> {
    try {
      const res = await auth.api.revokeUserSessions({
        body: { userId: payload.userId },
        headers: await headers(),
      });
      return { success: res.success };
    } catch (error) {
      throw error;
    }
  }

  async impersonateUser(payload: { userId: string }): Promise<{ session: unknown; user: TUserSchema }> {
    try {
      const res = await auth.api.impersonateUser({
        body: { userId: payload.userId },
        headers: await headers(),
      });
      const user = await UserSchema.parseAsync(res.user);
      return { session: res.session, user };
    } catch (error) {
      throw error;
    }
  }
}
