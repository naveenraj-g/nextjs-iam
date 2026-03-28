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
  AddMemberValidationSchema,
  TAddMemberValidationSchema,
  TOrgRoleSchema,
} from "@/modules/entities/schemas/admin/organizations/organizations.schema";
import { addMemberAction } from "@/modules/server/presentation/actions/admin/organizations.action";
import { listOrgRolesAction } from "@/modules/server/presentation/actions/admin/organizations.action";
import { handleZSAError } from "@/modules/client/shared/error/handleZSAError";
import { AddMemberForm } from "../../forms/organizations/AddMemberForm";

const DEFAULT_ROLES = ["member", "admin", "owner"];

export const AddMemberModal = () => {
  const closeModal = useAdminStore((state) => state.onClose);
  const modalType = useAdminStore((state) => state.type);
  const isOpen = useAdminStore((state) => state.isOpen);
  const modalData = useAdminStore((state) => state.data);

  const isModalOpen = isOpen && modalType === "addMember";

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

  const form = useForm<TAddMemberValidationSchema>({
    resolver: zodResolver(AddMemberValidationSchema),
    defaultValues: { organizationId: "", email: "", roles: [] },
  });

  const { execute } = useServerAction(addMemberAction, {
    onSuccess() {
      toast.success("Member added successfully.");
      handleClose();
    },
    onError({ err }) {
      handleZSAError<TAddMemberValidationSchema>({
        err,
        form,
        fallbackMessage: "Failed to add member",
      });
    },
  });

  async function handleSubmit(values: TAddMemberValidationSchema) {
    await execute({
      payload: { ...values, organizationId: modalData?.organizationId ?? values.organizationId },
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
          <DialogTitle>Add Member</DialogTitle>
          <DialogDescription>Add a user to this organization.</DialogDescription>
        </DialogHeader>
        <FormProvider {...form}>
          <AddMemberForm
            onSubmit={handleSubmit}
            onCancel={handleClose}
            availableRoles={availableRoles}
          />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};
