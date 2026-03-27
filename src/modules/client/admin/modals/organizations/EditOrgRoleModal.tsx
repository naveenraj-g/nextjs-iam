"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAdminStore } from "../../stores/admin.store";
import { useServerAction } from "zsa-react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import {
  UpdateOrgRoleValidationSchema,
  TUpdateOrgRoleValidationSchema,
} from "@/modules/entities/schemas/admin/organizations/organizations.schema";
import { TResourceActionSchema } from "@/modules/entities/schemas/admin/resources/resources.schema";
import { updateOrgRoleAction } from "@/modules/server/presentation/actions/admin/organizations.action";
import { listResourceActionsAction } from "@/modules/server/presentation/actions/admin";
import { handleZSAError } from "@/modules/client/shared/error/handleZSAError";
import { OrgRoleForm } from "../../forms/organizations/OrgRoleForm";

export const EditOrgRoleModal = () => {
  const closeModal = useAdminStore((state) => state.onClose);
  const modalType = useAdminStore((state) => state.type);
  const isOpen = useAdminStore((state) => state.isOpen);
  const modalData = useAdminStore((state) => state.data);

  const isModalOpen = isOpen && modalType === "editOrgRole";

  const [availableActions, setAvailableActions] = useState<TResourceActionSchema[]>([]);

  useEffect(() => {
    if (!isModalOpen) return;
    void (async () => {
      const [data] = await listResourceActionsAction();
      if (data) setAvailableActions(data);
    })();
  }, [isModalOpen]);

  const form = useForm<TUpdateOrgRoleValidationSchema>({
    resolver: zodResolver(UpdateOrgRoleValidationSchema),
    values: {
      organizationId: modalData?.orgRoleOrganizationId ?? "",
      role: modalData?.orgRoleName ?? "",
      permissions: modalData?.orgRolePermissions ?? [],
    },
  });

  const { execute } = useServerAction(updateOrgRoleAction, {
    onSuccess() {
      toast.success("Role updated successfully.");
      handleClose();
    },
    onError({ err }) {
      handleZSAError<TUpdateOrgRoleValidationSchema>({
        err,
        form,
        fallbackMessage: "Failed to update role",
      });
    },
  });

  async function handleSubmit(values: TUpdateOrgRoleValidationSchema) {
    await execute({
      payload: values,
      transportOptions: {
        shouldRevalidate: true,
        url: `/admin/organizations/${modalData?.orgRoleOrganizationId}/roles`,
      },
    });
  }

  function handleClose() {
    form.reset();
    setAvailableActions([]);
    closeModal();
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Role: {modalData?.orgRoleName}</DialogTitle>
          <DialogDescription>
            Update the permissions assigned to this role.
          </DialogDescription>
        </DialogHeader>
        <FormProvider {...form}>
          <OrgRoleForm
            onSubmit={handleSubmit}
            onCancel={handleClose}
            availableActions={availableActions}
            showRoleNameInput={false}
            submitLabel="Save Changes"
          />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};
