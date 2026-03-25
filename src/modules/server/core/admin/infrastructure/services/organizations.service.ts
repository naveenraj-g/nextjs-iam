import { prisma } from "../../../../../../../prisma/db";
import { IOrganizationsService } from "../../domain/interfaces/organizations.service.interface";
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
    const orgs = await prisma.organization.findMany({
      include: {
        _count: { select: { members: true, teams: true } },
      },
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

    return ListOrganizationsResponseSchema.parseAsync({ organizations });
  }

  async getOrganization(organizationId: string): Promise<TOrganizationDetailSchema> {
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

    return OrganizationDetailSchema.parseAsync(org);
  }

  async createOrganization(payload: TCreateOrganizationValidationSchema): Promise<TOrganizationSummarySchema> {
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

    return OrganizationSummarySchema.parseAsync({
      ...org,
      memberCount: 0,
      teamCount: 0,
    });
  }

  async updateOrganization(payload: TUpdateOrganizationValidationSchema): Promise<TOrganizationSummarySchema> {
    const { organizationId, ...data } = payload;

    const org = await prisma.organization.update({
      where: { id: organizationId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.slug && { slug: data.slug }),
        ...(data.logo !== undefined && { logo: data.logo || null }),
        ...(data.metadata !== undefined && { metadata: data.metadata || null }),
      },
      include: {
        _count: { select: { members: true, teams: true } },
      },
    });

    return OrganizationSummarySchema.parseAsync({
      ...org,
      memberCount: org._count.members,
      teamCount: org._count.teams,
    });
  }

  async deleteOrganization(payload: TDeleteOrganizationValidationSchema): Promise<{ success: boolean }> {
    await prisma.organization.delete({ where: { id: payload.organizationId } });
    return { success: true };
  }

  async addMember(payload: TAddMemberValidationSchema): Promise<{ success: boolean }> {
    await prisma.member.create({
      data: {
        id: crypto.randomUUID(),
        organizationId: payload.organizationId,
        userId: payload.userId,
        role: payload.role,
        createdAt: new Date(),
      },
    });
    return { success: true };
  }

  async updateMemberRole(payload: TUpdateMemberRoleValidationSchema): Promise<{ success: boolean }> {
    await prisma.member.update({
      where: { id: payload.memberId },
      data: { role: payload.role },
    });
    return { success: true };
  }

  async removeMember(payload: TRemoveMemberValidationSchema): Promise<{ success: boolean }> {
    await prisma.member.delete({ where: { id: payload.memberId } });
    return { success: true };
  }

  async createInvitation(payload: TCreateInvitationValidationSchema): Promise<{ success: boolean }> {
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
    return { success: true };
  }

  async cancelInvitation(payload: TCancelInvitationValidationSchema): Promise<{ success: boolean }> {
    await prisma.invitation.delete({ where: { id: payload.invitationId } });
    return { success: true };
  }

  async createTeam(payload: TCreateTeamValidationSchema): Promise<{ success: boolean }> {
    await prisma.team.create({
      data: {
        id: crypto.randomUUID(),
        name: payload.name,
        organizationId: payload.organizationId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    return { success: true };
  }

  async updateTeam(payload: TUpdateTeamValidationSchema): Promise<{ success: boolean }> {
    await prisma.team.update({
      where: { id: payload.teamId },
      data: { name: payload.name, updatedAt: new Date() },
    });
    return { success: true };
  }

  async removeTeam(payload: TRemoveTeamValidationSchema): Promise<{ success: boolean }> {
    await prisma.team.delete({ where: { id: payload.teamId } });
    return { success: true };
  }

  async addTeamMember(payload: TAddTeamMemberValidationSchema): Promise<{ success: boolean }> {
    await prisma.teamMember.create({
      data: {
        id: crypto.randomUUID(),
        teamId: payload.teamId,
        userId: payload.userId,
        createdAt: new Date(),
      },
    });
    return { success: true };
  }

  async removeTeamMember(payload: TRemoveTeamMemberValidationSchema): Promise<{ success: boolean }> {
    await prisma.teamMember.delete({ where: { id: payload.teamMemberId } });
    return { success: true };
  }
}
