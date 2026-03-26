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
  updateMenuNodeAction,
  listActionsAction,
} from "@/modules/server/presentation/actions/admin";
import { handleZSAError } from "@/modules/client/shared/error/handleZSAError";
import { MenuNodeForm } from "../../forms/apps/MenuNodeForm";

export const EditMenuNodeModal = () => {
  const closeModal = useAdminStore((state) => state.onClose);
  const modalType = useAdminStore((state) => state.type);
  const isOpen = useAdminStore((state) => state.isOpen);
  const modalData = useAdminStore((state) => state.data);

  const isModalOpen = isOpen && modalType === "editMenuNode";

  const [parentNodes, setParentNodes] = useState<{ id: string; label: string }[]>([]);
  const [availableActions, setAvailableActions] = useState<{ key: string; name: string }[]>([]);

  useEffect(() => {
    if (!isModalOpen || !modalData?.menuNodeAppId) return;
    listMenuNodesAction({ appId: modalData.menuNodeAppId }).then(([data]) => {
      if (data) {
        setParentNodes(
          data
            .filter((n) => n.id !== modalData?.menuNodeId)
            .map((n) => ({ id: n.id, label: n.label })),
        );
      }
    });
    listActionsAction().then(([data]) => {
      if (data) setAvailableActions(data.map((a) => ({ key: a.key, name: a.name })));
    });
  }, [isModalOpen, modalData?.menuNodeAppId, modalData?.menuNodeId]);

  const form = useForm<TUpdateMenuNodeFormSchema>({
    resolver: zodResolver(UpdateMenuNodeFormSchema),
    values: {
      label: modalData?.menuNodeLabel ?? "",
      slug: modalData?.menuNodeSlug ?? "",
      type: modalData?.menuNodeType ?? "ITEM",
      parentId: modalData?.menuNodeParentId ?? "",
      icon: modalData?.menuNodeIcon ?? "",
      href: modalData?.menuNodeHref ?? "",
      order: modalData?.menuNodeOrder ?? 0,
      isActive: modalData?.menuNodeIsActive ?? true,
      permissionKeys: modalData?.menuNodePermissionKeys ?? [],
    },
  });

  const { execute } = useServerAction(updateMenuNodeAction, {
    onSuccess() {
      toast.success("Menu node updated successfully.");
      handleClose();
    },
    onError({ err }) {
      handleZSAError<TUpdateMenuNodeFormSchema>({
        err,
        form,
        fallbackMessage: "Failed to update menu node",
      });
    },
  });

  async function handleSubmit(values: TUpdateMenuNodeFormSchema) {
    if (!modalData?.menuNodeId) return;
    await execute({
      payload: {
        id: modalData.menuNodeId,
        label: values.label,
        slug: values.slug,
        type: values.type,
        parentId: (values.parentId && values.parentId !== "__none__") ? values.parentId : null,
        icon: values.icon || null,
        href: values.href || null,
        order: values.order,
        isActive: values.isActive,
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
          <DialogTitle>Edit Menu Node</DialogTitle>
          <DialogDescription>
            Update the details of{" "}
            <span className="font-medium">{modalData?.menuNodeLabel}</span>.
          </DialogDescription>
        </DialogHeader>
        <FormProvider {...form}>
          <MenuNodeForm
            onSubmit={handleSubmit}
            onCancel={handleClose}
            appId={modalData?.menuNodeAppId ?? ""}
            parentNodes={parentNodes}
            availableActions={availableActions}
            submitLabel="Save Changes"
          />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};
