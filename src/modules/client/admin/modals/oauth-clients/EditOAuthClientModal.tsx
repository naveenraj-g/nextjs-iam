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
import {
  UpdateOAuthClientFormSchema,
  TUpdateOAuthClientFormSchema,
} from "@/modules/entities/schemas/admin/oauthclient/oauthclient.schema";
import { OAuthClientEditForm } from "../../forms/OAuthClientEditForm";
import { updateOAuthClientAction } from "@/modules/server/presentation/actions/admin";
import { handleZSAError } from "@/modules/client/shared/error/handleZSAError";

export const EditOAuthClientModal = () => {
  const closeModal = useAdminStore((state) => state.onClose);
  const modalType = useAdminStore((state) => state.type);
  const isOpen = useAdminStore((state) => state.isOpen);
  const modalData = useAdminStore((state) => state.data);

  const isModalOpen = isOpen && modalType === "editOAuthClient";

  const client = modalData?.oauthClient;

  const form = useForm<TUpdateOAuthClientFormSchema>({
    resolver: zodResolver(UpdateOAuthClientFormSchema),
    values: {
      client_id: client?.client_id ?? "",
      update: {
        client_name: client?.client_name ?? undefined,
        scope: client?.scope ?? undefined,
        client_uri: client?.client_uri ?? undefined,
        logo_uri: client?.logo_uri ?? undefined,
        redirect_uris: client?.redirect_uris ?? [],
        post_logout_redirect_uris:
          client?.post_logout_redirect_uris ?? undefined,
        grant_types: client?.grant_types ?? undefined,
        response_types: client?.response_types ?? undefined,
        type: client?.type ?? undefined,
      },
    },
  });

  const { execute } = useServerAction(updateOAuthClientAction, {
    onSuccess() {
      toast.success("OAuth Client updated.");
      handleCloseModal();
    },
    onError({ err }) {
      handleZSAError<TUpdateOAuthClientFormSchema>({
        err,
        form,
        fallbackMessage: "Failed to update OAuth Client",
      });
    },
  });

  async function handleUpdate(values: TUpdateOAuthClientFormSchema) {
    const cleanedPostLogout = values.update.post_logout_redirect_uris
      ?.map((v) => v.trim())
      .filter(Boolean);

    await execute({
      payload: {
        ...values,
        update: {
          ...values.update,
          post_logout_redirect_uris:
            cleanedPostLogout && cleanedPostLogout.length > 0
              ? cleanedPostLogout
              : undefined,
        },
      },
      transportOptions: { shouldRevalidate: true, url: "/admin/oauth-clients" },
    });
  }

  function handleCloseModal() {
    form.reset();
    closeModal();
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit OAuth Client</DialogTitle>
          <DialogDescription>
            Update settings for{" "}
            <span className="font-medium">
              {modalData?.clientName ?? "this client"}
            </span>
            .
          </DialogDescription>
        </DialogHeader>
        <FormProvider {...form}>
          <OAuthClientEditForm
            onSubmit={handleUpdate}
            onCancel={handleCloseModal}
          />
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};
