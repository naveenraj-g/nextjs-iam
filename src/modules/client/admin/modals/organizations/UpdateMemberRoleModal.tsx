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
  UpdateMemberRoleValidationSchema,
  TUpdateMemberRoleValidationSchema,
  TOrgRoleSchema,
} from "@/modules/entities/schemas/admin/organizations/organizations.schema";
import { updateMemberRoleAction } from "@/modules/server/presentation/actions/admin/organizations.action";
import { listOrgRolesAction } from "@/modules/server/presentation/actions/admin/organizations.action";
import { handleZSAError } from "@/modules/client/shared/error/handleZSAError";
import { UpdateMemberRoleForm } from "../../forms/organizations/UpdateMemberRoleForm";

const DEFAULT_ROLES = ["member", "admin", "owner"];

export const UpdateMemberRoleModal = () => {
  const closeModal = useAdminStore((state) => state.onClose);
  const modalType = useAdminStore((state) => state.type);
  const isOpen = useAdminStore((state) => state.isOpen);
  const modalData = useAdminStore((state) => state.data);

  const isModalOpen = isOpen && modalType === "updateMemberRole";

  const [availableRoles, setAvailableRoles] = useState<string[]>(DEFAULT_ROLES);

  useEffect(() => {
    if (!isModalOpen || !modalData?.organizationId) return;
    void (async () => {
      const [data] = await listOrgRolesAction({ organizationId: modalData.organizationId! });
      if (data) {
        const customRoles = (data as TOrgRoleSchema[]).map((r) => r.role);
        const combined = [...DEFAULT_ROLES, ...customRoles.filter((r: string) => !DEFAULT_ROLES.includes(r))];
        setAvailableRoles(combined);
      }
    })();
  }, [isModalOpen, modalData?.organizationId]);

  const form = useForm<TUpdateMemberRoleValidationSchema>({
    resolver: zodResolver(UpdateMemberRoleValidationSchema),
    values: {
      memberId: modalData?.memberId ?? "",
      organizationId: modalData?.organizationId ?? "",
      roles: modalData?.memberRoles ?? [],
    },
  });

  const { execute } = useServerAction(updateMemberRoleAction, {
    onSuccess() {
      toast.success("Member role updated successfully.");
      handleClose();
    },
    onError({ err }) {
      handleZSAError<TUpdateMemberRoleValidationSchema>({
        err,
        form,
        fallbackMessage: "Failed to update member role",
      });
    },
  });

  async function handleSubmit(values: TUpdateMemberRoleValidationSchema) {
    await execute({
      payload: values,
      transportOptions: {
        shouldRevalidate: true,
        url: `/admin/organizations/${modalData?.organizationId}`,
      },
    });
  }

  function handleClose() {
    form.reset();
    setAvailableRoles(DEFAULT_ROLES);
    closeModal();
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Member Role</DialogTitle>
          <DialogDescription>
            Change the role of <span className="font-semibold">{modalData?.memberName}</span>.
          </DialogDescription>
        </DialogHeader>
        <FormProvider {...form}>
          <UpdateMemberRoleForm
            onSubmit={handleSubmit}
            onCancel={handleClose}
            availableRoles={availableRoles}
          />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};
