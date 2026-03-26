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
  UpdateMenuNodeFormSchema,
  TUpdateMenuNodeFormSchema,
} from "@/modules/entities/schemas/admin/apps/apps.schema";
import {
  listMenuNodesAction,
  createMenuNodeAction,
  listActionsAction,
} from "@/modules/server/presentation/actions/admin";
import { handleZSAError } from "@/modules/client/shared/error/handleZSAError";
import { MenuNodeForm } from "../../forms/apps/MenuNodeForm";

export const CreateMenuNodeModal = () => {
  const closeModal = useAdminStore((state) => state.onClose);
  const modalType = useAdminStore((state) => state.type);
  const isOpen = useAdminStore((state) => state.isOpen);
  const modalData = useAdminStore((state) => state.data);

  const isModalOpen = isOpen && modalType === "createMenuNode";

  const [parentNodes, setParentNodes] = useState<{ id: string; label: string }[]>([]);
  const [availableActions, setAvailableActions] = useState<{ key: string; name: string }[]>([]);

  useEffect(() => {
    if (!isModalOpen || !modalData?.menuNodeAppId) return;
    listMenuNodesAction({ appId: modalData.menuNodeAppId }).then(([data]) => {
      if (data) setParentNodes(data.map((n) => ({ id: n.id, label: n.label })));
    });
    listActionsAction().then(([data]) => {
      if (data) setAvailableActions(data.map((a) => ({ key: a.key, name: a.name })));
    });
  }, [isModalOpen, modalData?.menuNodeAppId]);

  const form = useForm<TUpdateMenuNodeFormSchema>({
    resolver: zodResolver(UpdateMenuNodeFormSchema),
    defaultValues: {
      label: "",
      slug: "",
      type: "ITEM",
      parentId: "",
      icon: "",
      href: "",
      order: 0,
      isActive: true,
      permissionKeys: [],
    },
  });

  const { execute } = useServerAction(createMenuNodeAction, {
    onSuccess() {
      toast.success("Menu node created successfully.");
      handleClose();
    },
    onError({ err }) {
      handleZSAError<TUpdateMenuNodeFormSchema>({
        err,
        form,
        fallbackMessage: "Failed to create menu node",
      });
    },
  });

  async function handleSubmit(values: TUpdateMenuNodeFormSchema) {
    if (!modalData?.menuNodeAppId) return;
    await execute({
      payload: {
        appId: modalData.menuNodeAppId,
        label: values.label,
        slug: values.slug,
        type: values.type,
        parentId: (values.parentId && values.parentId !== "__none__") ? values.parentId : undefined,
        icon: values.icon || undefined,
        href: values.href || undefined,
        order: values.order,
        permissionKeys: values.permissionKeys,
      },
      transportOptions: {
        shouldRevalidate: true,
        url: `/admin/apps/${modalData?.menuNodeAppId}/menus`,
      },
    });
  }

  function handleClose() {
    form.reset();
    setParentNodes([]);
    setAvailableActions([]);
    closeModal();
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Menu Node</DialogTitle>
          <DialogDescription>
            Add a new menu node to this application.
          </DialogDescription>
        </DialogHeader>
        <FormProvider {...form}>
          <MenuNodeForm
            onSubmit={handleSubmit}
            onCancel={handleClose}
            appId={modalData?.menuNodeAppId ?? ""}
            parentNodes={parentNodes}
            availableActions={availableActions}
            submitLabel="Create Node"
          />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};
