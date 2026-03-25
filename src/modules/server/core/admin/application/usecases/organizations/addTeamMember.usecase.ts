import { getInjection } from "@/modules/server/di/container";
import { TAddTeamMemberValidationSchema } from "@/modules/entities/schemas/admin/organizations/organizations.schema";

export async function addTeamMemberUseCase(payload: TAddTeamMemberValidationSchema): Promise<{ success: boolean }> {
  const service = getInjection("IOrganizationsService");
  return service.addTeamMember(payload);
}
