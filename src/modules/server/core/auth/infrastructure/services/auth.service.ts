import { randomUUID } from "crypto";
import {
  SignupResponseDtoSchema,
  TSignupResponseDtoSchema,
  TSigninResponseDtoSchema,
  SigninResponseDtoSchema,
  SignoutResponseDtoSchema,
  TSignoutResponseDtoSchema,
  SigninWithSocialResponseDtoSchema,
  TSigninWithSocialResponseDtoSchema,
  SendEmailVerificationDtoSchema,
  TSendEmailVerificationDtoSchema,
} from "@/modules/entities/schemas/auth";
import { auth } from "@/modules/server/auth-provider/auth";
import { IAuthService } from "../../domain/interfaces/auth.service.interface";
import { mapBetterAuthError } from "@/modules/server/shared/errors/mappers/mapBetterAuthError";
import { headers } from "next/headers";
import {
  TSendEmailVerificationPayload,
  TSigninEmailPayload,
  TSigninWithSocialPayload,
  TSignupEmailPayload,
} from "@/modules/entities/types/auth";
import { logOperation } from "@/modules/server/config/logger/log-operation";

export class AuthService implements IAuthService {
  async signUpWithEmail(
    payload: TSignupEmailPayload,
  ): Promise<TSignupResponseDtoSchema> {
    const startTimeMs = Date.now();
    const operationId = randomUUID();
    logOperation("start", { name: "AuthService.signUpWithEmail", startTimeMs, context: { operationId, email: payload.email } });
    try {
      const res = await auth.api.signUpEmail({
        body: {
          name: payload.name,
          email: payload.email,
          password: payload.password,
          callbackURL: "/",
        },
      });
      const data = await SignupResponseDtoSchema.parseAsync(res);
      logOperation("success", { name: "AuthService.signUpWithEmail", startTimeMs, data, context: { operationId, email: payload.email } });
      return data;
    } catch (error) {
      logOperation("error", { name: "AuthService.signUpWithEmail", startTimeMs, err: error, context: { operationId, email: payload.email } });
      mapBetterAuthError(error, "Failed to sign up user");
    }
  }

  async signInWithEmail(
    payload: TSigninEmailPayload,
  ): Promise<TSigninResponseDtoSchema> {
    const startTimeMs = Date.now();
    const operationId = randomUUID();
    logOperation("start", { name: "AuthService.signInWithEmail", startTimeMs, context: { operationId, email: payload.email } });
    try {
      const res = await auth.api.signInEmail({
        body: {
          email: payload.email,
          password: payload.password,
          rememberMe: payload.rememberMe,
          callbackURL: "/",
        },
      });
      const data = await SigninResponseDtoSchema.parseAsync(res);
      logOperation("success", { name: "AuthService.signInWithEmail", startTimeMs, data, context: { operationId, email: payload.email } });
      return data;
    } catch (error) {
      logOperation("error", { name: "AuthService.signInWithEmail", startTimeMs, err: error, context: { operationId, email: payload.email } });
      mapBetterAuthError(error, "Failed to sign in user");
    }
  }

  async signInWithSocial(
    payload: TSigninWithSocialPayload,
  ): Promise<TSigninWithSocialResponseDtoSchema> {
    const startTimeMs = Date.now();
    const operationId = randomUUID();
    logOperation("start", {
      name: "AuthService.signInWithSocial",
      startTimeMs,
      context: { operationId, provider: payload.provider },
    });
    try {
      const res = await auth.api.signInSocial({
        body: { provider: payload.provider, callbackURL: "/" },
      });
      const data = await SigninWithSocialResponseDtoSchema.parseAsync(res);
      logOperation("success", {
        name: "AuthService.signInWithSocial",
        startTimeMs,
        data,
        context: { operationId, provider: payload.provider },
      });
      return data;
    } catch (error) {
      logOperation("error", {
        name: "AuthService.signInWithSocial",
        startTimeMs,
        err: error,
        context: { operationId, provider: payload.provider },
      });
      mapBetterAuthError(error, "Failed to sign in user");
    }
  }

  async signOut(): Promise<TSignoutResponseDtoSchema> {
    const startTimeMs = Date.now();
    const operationId = randomUUID();
    logOperation("start", { name: "AuthService.signOut", startTimeMs, context: { operationId } });
    try {
      const res = await auth.api.signOut({ headers: await headers() });
      const data = await SignoutResponseDtoSchema.parseAsync({
        ...res,
        url: res.success ? "/" : null,
      });
      logOperation("success", { name: "AuthService.signOut", startTimeMs, data, context: { operationId } });
      return data;
    } catch (error) {
      logOperation("error", { name: "AuthService.signOut", startTimeMs, err: error, context: { operationId } });
      mapBetterAuthError(error, "Failed to sign out user");
    }
  }

  async sendEmailVerification(
    payload: TSendEmailVerificationPayload,
  ): Promise<TSendEmailVerificationDtoSchema> {
    const startTimeMs = Date.now();
    const operationId = randomUUID();
    logOperation("start", { name: "AuthService.sendEmailVerification", startTimeMs, context: { operationId, email: payload.email } });
    try {
      const res = await auth.api.sendVerificationEmail({
        body: { email: payload.email, callbackURL: "/" },
      });
      const data = await SendEmailVerificationDtoSchema.parseAsync({ success: res.status });
      logOperation("success", { name: "AuthService.sendEmailVerification", startTimeMs, data, context: { operationId, email: payload.email } });
      return data;
    } catch (error) {
      logOperation("error", { name: "AuthService.sendEmailVerification", startTimeMs, err: error, context: { operationId, email: payload.email } });
      mapBetterAuthError(error, "Failed to send verification email");
    }
  }
}
