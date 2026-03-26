import { randomUUID } from "crypto";
import { prisma } from "../../../../../../../prisma/db";
import { IOrganizationsService } from "../../domain/interfaces/organizations.service.interface";
import { logOperation } from "@/modules/server/config/logger/log-operation";
import { InfrastructureError } from "@/modules/server/shared/errors/infrastructureError";
import {
  ListOrganizationsResponseSchema,
  OrganizationDetailSchema,
  OrganizationSummarySchema,
  TListOrganizationsResponseSchema,
  TOrganizationDetailSchema,
  TOrganizationSummarySchema,
  TCreateOrganizationValidationSchema,
  TUpdateOrganizationValidationSchema,
  TDeleteOrganizationValidationSchema,
  TAddMemberValidationSchema,
  TUpdateMemberRoleValidationSchema,
  TRemoveMemberValidationSchema,
  TCreateInvitationValidationSchema,
  TCancelInvitationValidationSchema,
  TCreateTeamValidationSchema,
  TUpdateTeamValidationSchema,
  TRemoveTeamValidationSchema,
  TAddTeamMemberValidationSchema,
  TRemoveTeamMemberValidationSchema,
} from "@/modules/entities/schemas/admin/organizations/organizations.schema";

export class OrganizationsService implements IOrganizationsService {
  async listOrganizations(): Promise<TListOrganizationsResponseSchema> {
    const startTimeMs = Date.now();
    const operationId = randomUUID();
    logOperation("start", { name: "OrganizationsService.listOrganizations", startTimeMs, context: { operationId } });
    try {
      const orgs = await prisma.organization.findMany({
        include: { _count: { select: { members: true, teams: true } } },
        orderBy: { createdAt: "desc" },
      });
      const organizations = orgs.map((org) => ({
        id: org.id,
        name: org.name,
        slug: org.slug,
        logo: org.logo,
        createdAt: org.createdAt,
        metadata: org.metadata,
        memberCount: org._count.members,
        teamCount: org._count.teams,
      }));
      const data = await ListOrganizationsResponseSchema.parseAsync({ organizations });
      logOperation("success", { name: "OrganizationsService.listOrganizations", startTimeMs, data, context: { operationId } });
      return data;
    } catch (error) {
      logOperation("error", { name: "OrganizationsService.listOrganizations", startTimeMs, err: error, context: { operationId } });
      throw new InfrastructureError("Failed to list organizations", error);
    }
  }

  async getOrganization(organizationId: string): Promise<TOrganizationDetailSchema> {
    const startTimeMs = Date.now();
    const operationId = randomUUID();
    logOperation("start", {
      name: "OrganizationsService.getOrganization",
      startTimeMs,
      context: { operationId, organizationId },
    });
    try {
      const org = await prisma.organization.findUniqueOrThrow({
        where: { id: organizationId },
        include: {
          members: {
            include: {
              user: { select: { id: true, name: true, email: true, image: true } },
            },
            orderBy: { createdAt: "desc" },
          },
          invitations: {
            include: {
              user: { select: { name: true, email: true } },
            },
            orderBy: { createdAt: "desc" },
          },
          teams: {
            include: {
              teammembers: {
                include: {
                  user: { select: { id: true, name: true, email: true, image: true } },
                },
              },
            },
            orderBy: { createdAt: "desc" },
          },
        },
      });
      const data = await OrganizationDetailSchema.parseAsync(org);
      logOperation("success", {
        name: "OrganizationsService.getOrganization",
        startTimeMs,
        data,
        context: { operationId, organizationId },
      });
      return data;
    } catch (error) {
      logOperation("error", {
        name: "OrganizationsService.getOrganization",
        startTimeMs,
        err: error,
        context: { operationId, organizationId },
      });
      throw new InfrastructureError("Failed to get organization", error);
    }
  }

  async createOrganization(
    payload: TCreateOrganizationValidationSchema,
  ): Promise<TOrganizationSummarySchema> {
    const startTimeMs = Date.now();
    const operationId = randomUUID();
    logOperation("start", { name: "OrganizationsService.createOrganization", startTimeMs, context: { operationId } });
    try {
      const org = await prisma.organization.create({
        data: {
          id: crypto.randomUUID(),
          name: payload.name,
          slug: payload.slug,
          logo: payload.logo || null,
          metadata: payload.metadata || null,
          createdAt: new Date(),
        },
      });
      const data = await OrganizationSummarySchema.parseAsync({ ...org, memberCount: 0, teamCount: 0 });
      logOperation("success", { name: "OrganizationsService.createOrganization", startTimeMs, data, context: { operationId } });
      return data;
    } catch (error) {
      logOperation("error", { name: "OrganizationsService.createOrganization", startTimeMs, err: error, context: { operationId } });
      throw new InfrastructureError("Failed to create organization", error);
    }
  }

  async updateOrganization(
    payload: TUpdateOrganizationValidationSchema,
  ): Promise<TOrganizationSummarySchema> {
    const startTimeMs = Date.now();
    const operationId = randomUUID();
    logOperation("start", {
      name: "OrganizationsService.updateOrganization",
      startTimeMs,
      context: { operationId, organizationId: payload.organizationId },
    });
    try {
      const { organizationId, ...updateData } = payload;
      const org = await prisma.organization.update({
        where: { id: organizationId },
        data: {
          ...(updateData.name && { name: updateData.name }),
          ...(updateData.slug && { slug: updateData.slug }),
          ...(updateData.logo !== undefined && { logo: updateData.logo || null }),
          ...(updateData.metadata !== undefined && { metadata: updateData.metadata || null }),
        },
        include: { _count: { select: { members: true, teams: true } } },
      });
      const data = await OrganizationSummarySchema.parseAsync({
        ...org,
        memberCount: org._count.members,
        teamCount: org._count.teams,
      });
      logOperation("success", {
        name: "OrganizationsService.updateOrganization",
        startTimeMs,
        data,
        context: { operationId, organizationId: payload.organizationId },
      });
      return data;
    } catch (error) {
      logOperation("error", {
        name: "OrganizationsService.updateOrganization",
        startTimeMs,
        err: error,
        context: { operationId, organizationId: payload.organizationId },
      });
      throw new InfrastructureError("Failed to update organization", error);
    }
  }

  async deleteOrganization(
    payload: TDeleteOrganizationValidationSchema,
  ): Promise<{ success: boolean }> {
    const startTimeMs = Date.now();
    const operationId = randomUUID();
    logOperation("start", {
      name: "OrganizationsService.deleteOrganization",
      startTimeMs,
      context: { operationId, organizationId: payload.organizationId },
    });
    try {
      await prisma.organization.delete({ where: { id: payload.organizationId } });
      const data = { success: true };
      logOperation("success", {
        name: "OrganizationsService.deleteOrganization",
        startTimeMs,
        data,
        context: { operationId, organizationId: payload.organizationId },
      });
      return data;
    } catch (error) {
      logOperation("error", {
        name: "OrganizationsService.deleteOrganization",
        startTimeMs,
        err: error,
        context: { operationId, organizationId: payload.organizationId },
      });
      throw new InfrastructureError("Failed to delete organization", error);
    }
  }

  async addMember(payload: TAddMemberValidationSchema): Promise<{ success: boolean }> {
    const startTimeMs = Date.now();
    const operationId = randomUUID();
    logOperation("start", {
      name: "OrganizationsService.addMember",
      startTimeMs,
      userId: payload.userId,
      context: { operationId, organizationId: payload.organizationId },
    });
    try {
      await prisma.member.create({
        data: {
          id: crypto.randomUUID(),
          organizationId: payload.organizationId,
          userId: payload.userId,
          role: payload.role,
          createdAt: new Date(),
        },
      });
      const data = { success: true };
      logOperation("success", {
        name: "OrganizationsService.addMember",
        startTimeMs,
        userId: payload.userId,
        data,
        context: { operationId, organizationId: payload.organizationId },
      });
      return data;
    } catch (error) {
      logOperation("error", {
        name: "OrganizationsService.addMember",
        startTimeMs,
        userId: payload.userId,
        err: error,
        context: { operationId, organizationId: payload.organizationId },
      });
      throw new InfrastructureError("Failed to add member", error);
    }
  }

  async updateMemberRole(
    payload: TUpdateMemberRoleValidationSchema,
  ): Promise<{ success: boolean }> {
    const startTimeMs = Date.now();
    const operationId = randomUUID();
    logOperation("start", {
      name: "OrganizationsService.updateMemberRole",
      startTimeMs,
      context: { operationId, memberId: payload.memberId },
    });
    try {
      await prisma.member.update({ where: { id: payload.memberId }, data: { role: payload.role } });
      const data = { success: true };
      logOperation("success", {
        name: "OrganizationsService.updateMemberRole",
        startTimeMs,
        data,
        context: { operationId, memberId: payload.memberId },
      });
      return data;
    } catch (error) {
      logOperation("error", {
        name: "OrganizationsService.updateMemberRole",
        startTimeMs,
        err: error,
        context: { operationId, memberId: payload.memberId },
      });
      throw new InfrastructureError("Failed to update member role", error);
    }
  }

  async removeMember(payload: TRemoveMemberValidationSchema): Promise<{ success: boolean }> {
    const startTimeMs = Date.now();
    const operationId = randomUUID();
    logOperation("start", {
      name: "OrganizationsService.removeMember",
      startTimeMs,
      context: { operationId, memberId: payload.memberId },
    });
    try {
      await prisma.member.delete({ where: { id: payload.memberId } });
      const data = { success: true };
      logOperation("success", {
        name: "OrganizationsService.removeMember",
        startTimeMs,
        data,
        context: { operationId, memberId: payload.memberId },
      });
      return data;
    } catch (error) {
      logOperation("error", {
        name: "OrganizationsService.removeMember",
        startTimeMs,
        err: error,
        context: { operationId, memberId: payload.memberId },
      });
      throw new InfrastructureError("Failed to remove member", error);
    }
  }

  async createInvitation(
    payload: TCreateInvitationValidationSchema,
  ): Promise<{ success: boolean }> {
    const startTimeMs = Date.now();
    const operationId = randomUUID();
    logOperation("start", {
      name: "OrganizationsService.createInvitation",
      startTimeMs,
      context: { operationId, organizationId: payload.organizationId },
    });
    try {
      // Find or get a superadmin to use as inviter (admin-initiated invitation)
      const superadmin = await prisma.user.findFirst({ where: { role: "superadmin" } });
      if (!superadmin) throw new Error("No superadmin found to act as inviter");

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 day expiry

      await prisma.invitation.create({
        data: {
          id: crypto.randomUUID(),
          organizationId: payload.organizationId,
          email: payload.email,
          role: payload.role,
          status: "pending",
          expiresAt,
          inviterId: superadmin.id,
          ...(payload.teamId && { teamId: payload.teamId }),
        },
      });
      const data = { success: true };
      logOperation("success", {
        name: "OrganizationsService.createInvitation",
        startTimeMs,
        data,
        context: { operationId, organizationId: payload.organizationId },
      });
      return data;
    } catch (error) {
      logOperation("error", {
        name: "OrganizationsService.createInvitation",
        startTimeMs,
        err: error,
        context: { operationId, organizationId: payload.organizationId },
      });
      throw new InfrastructureError("Failed to create invitation", error);
    }
  }

  async cancelInvitation(
    payload: TCancelInvitationValidationSchema,
  ): Promise<{ success: boolean }> {
    const startTimeMs = Date.now();
    const operationId = randomUUID();
    logOperation("start", {
      name: "OrganizationsService.cancelInvitation",
      startTimeMs,
      context: { operationId, invitationId: payload.invitationId },
    });
    try {
      await prisma.invitation.delete({ where: { id: payload.invitationId } });
      const data = { success: true };
      logOperation("success", {
        name: "OrganizationsService.cancelInvitation",
        startTimeMs,
        data,
        context: { operationId, invitationId: payload.invitationId },
      });
      return data;
    } catch (error) {
      logOperation("error", {
        name: "OrganizationsService.cancelInvitation",
        startTimeMs,
        err: error,
        context: { operationId, invitationId: payload.invitationId },
      });
      throw new InfrastructureError("Failed to cancel invitation", error);
    }
  }

  async createTeam(payload: TCreateTeamValidationSchema): Promise<{ success: boolean }> {
    const startTimeMs = Date.now();
    const operationId = randomUUID();
    logOperation("start", {
      name: "OrganizationsService.createTeam",
      startTimeMs,
      context: { operationId, organizationId: payload.organizationId },
    });
    try {
      await prisma.team.create({
        data: {
          id: crypto.randomUUID(),
          name: payload.name,
          organizationId: payload.organizationId,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      const data = { success: true };
      logOperation("success", {
        name: "OrganizationsService.createTeam",
        startTimeMs,
        data,
        context: { operationId, organizationId: payload.organizationId },
      });
      return data;
    } catch (error) {
      logOperation("error", {
        name: "OrganizationsService.createTeam",
        startTimeMs,
        err: error,
        context: { operationId, organizationId: payload.organizationId },
      });
      throw new InfrastructureError("Failed to create team", error);
    }
  }

  async updateTeam(payload: TUpdateTeamValidationSchema): Promise<{ success: boolean }> {
    const startTimeMs = Date.now();
    const operationId = randomUUID();
    logOperation("start", {
      name: "OrganizationsService.updateTeam",
      startTimeMs,
      context: { operationId, teamId: payload.teamId },
    });
    try {
      await prisma.team.update({
        where: { id: payload.teamId },
        data: { name: payload.name, updatedAt: new Date() },
      });
      const data = { success: true };
      logOperation("success", {
        name: "OrganizationsService.updateTeam",
        startTimeMs,
        data,
        context: { operationId, teamId: payload.teamId },
      });
      return data;
    } catch (error) {
      logOperation("error", {
        name: "OrganizationsService.updateTeam",
        startTimeMs,
        err: error,
        context: { operationId, teamId: payload.teamId },
      });
      throw new InfrastructureError("Failed to update team", error);
    }
  }

  async removeTeam(payload: TRemoveTeamValidationSchema): Promise<{ success: boolean }> {
    const startTimeMs = Date.now();
    const operationId = randomUUID();
    logOperation("start", {
      name: "OrganizationsService.removeTeam",
      startTimeMs,
      context: { operationId, teamId: payload.teamId },
    });
    try {
      await prisma.team.delete({ where: { id: payload.teamId } });
      const data = { success: true };
      logOperation("success", {
        name: "OrganizationsService.removeTeam",
        startTimeMs,
        data,
        context: { operationId, teamId: payload.teamId },
      });
      return data;
    } catch (error) {
      logOperation("error", {
        name: "OrganizationsService.removeTeam",
        startTimeMs,
        err: error,
        context: { operationId, teamId: payload.teamId },
      });
      throw new InfrastructureError("Failed to remove team", error);
    }
  }

  async addTeamMember(payload: TAddTeamMemberValidationSchema): Promise<{ success: boolean }> {
    const startTimeMs = Date.now();
    const operationId = randomUUID();
    logOperation("start", {
      name: "OrganizationsService.addTeamMember",
      startTimeMs,
      userId: payload.userId,
      context: { operationId, teamId: payload.teamId },
    });
    try {
      await prisma.teamMember.create({
        data: {
          id: crypto.randomUUID(),
          teamId: payload.teamId,
          userId: payload.userId,
          createdAt: new Date(),
        },
      });
      const data = { success: true };
      logOperation("success", {
        name: "OrganizationsService.addTeamMember",
        startTimeMs,
        userId: payload.userId,
        data,
        context: { operationId, teamId: payload.teamId },
      });
      return data;
    } catch (error) {
      logOperation("error", {
        name: "OrganizationsService.addTeamMember",
        startTimeMs,
        userId: payload.userId,
        err: error,
        context: { operationId, teamId: payload.teamId },
      });
      throw new InfrastructureError("Failed to add team member", error);
    }
  }

  async removeTeamMember(
    payload: TRemoveTeamMemberValidationSchema,
  ): Promise<{ success: boolean }> {
    const startTimeMs = Date.now();
    const operationId = randomUUID();
    logOperation("start", {
      name: "OrganizationsService.removeTeamMember",
      startTimeMs,
      context: { operationId, teamMemberId: payload.teamMemberId },
    });
    try {
      await prisma.teamMember.delete({ where: { id: payload.teamMemberId } });
      const data = { success: true };
      logOperation("success", {
        name: "OrganizationsService.removeTeamMember",
        startTimeMs,
        data,
        context: { operationId, teamMemberId: payload.teamMemberId },
      });
      return data;
    } catch (error) {
      logOperation("error", {
        name: "OrganizationsService.removeTeamMember",
        startTimeMs,
        err: error,
        context: { operationId, teamMemberId: payload.teamMemberId },
      });
      throw new InfrastructureError("Failed to remove team member", error);
    }
  }
}
