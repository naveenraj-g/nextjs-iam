import { getInjection } from "@/modules/server/di/container";
import { TAddMemberValidationSchema } from "@/modules/entities/schemas/admin/organizations/organizations.schema";

export async function addMemberUseCase(payload: TAddMemberValidationSchema): Promise<{ success: boolean }> {
  const service = getInjection("IOrganizationsService");
  return service.addMember(payload);
}
