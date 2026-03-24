"use client";

import { useFormContext, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { SelectItem } from "@/components/ui/select";
import { Loader2, Plus, Trash } from "lucide-react";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { TUpdateOAuthClientFormSchema } from "@/modules/entities/schemas/admin/oauthclient/oauthclient.schema";
import { FormInput, FormSelect } from "../../shared/custom-form-fields";

interface OAuthClientEditFormProps {
  onSubmit: (data: TUpdateOAuthClientFormSchema) => Promise<void>;
  onCancel: () => void;
}

export function OAuthClientEditForm({
  onSubmit,
  onCancel,
}: OAuthClientEditFormProps) {
  const form = useFormContext<TUpdateOAuthClientFormSchema>();

  const {
    formState: { isSubmitting, errors },
    control,
  } = form;

  const redirectUris = useFieldArray({
    control: control as never,
    name: "update.redirect_uris",
  });

  const postLogoutRedirectUris = useFieldArray({
    control: control as never,
    name: "update.post_logout_redirect_uris",
  });

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-6"
    >
      {/* Basic Info */}
      <FieldGroup>
        <FieldSet>
          <FieldLegend>Basic Information</FieldLegend>
          <FieldGroup className="grid sm:grid-cols-2 gap-4">
            <FormInput
              control={control}
              name="update.client_name"
              label="Client Name"
              placeholder="My App"
            />
            <FormInput
              control={control}
              name="update.scope"
              label="Scope"
              placeholder="openid profile email"
            />
            <FormInput
              control={control}
              name="update.client_uri"
              label="Client URL"
              placeholder="https://example.com"
            />
            <FormInput
              control={control}
              name="update.logo_uri"
              label="Logo URL"
              placeholder="https://example.com/logo.png"
            />
          </FieldGroup>
        </FieldSet>
      </FieldGroup>

      {/* Redirects */}
      <FieldGroup>
        <FieldSet>
          <FieldLegend>Redirect Configuration</FieldLegend>

          <Field>
            <FieldLabel>Redirect URIs</FieldLabel>
            <FieldDescription>
              Allowed callback URLs after login.
            </FieldDescription>
            <div className="space-y-2">
              {redirectUris.fields.map((item, index) => (
                <div key={item.id} className="flex gap-2 items-center">
                  <FormInput
                    control={control}
                    name={`update.redirect_uris.${index}`}
                    placeholder="https://app.com/callback"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => redirectUris.remove(index)}
                    className="self-end"
                  >
                    <Trash size={16} />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => redirectUris.append("" as never)}
                className="flex items-center gap-2"
              >
                <Plus size={16} />
                Add Redirect URI
              </Button>
            </div>
            <FieldError errors={[errors.update?.redirect_uris]} />
          </Field>

          <Field>
            <FieldLabel>Post Logout Redirect URIs</FieldLabel>
            <FieldDescription>
              Where users are redirected after logout.
            </FieldDescription>
            <div className="space-y-2">
              {postLogoutRedirectUris.fields.map((item, index) => (
                <div key={item.id} className="flex gap-2 items-center">
                  <FormInput
                    control={control}
                    name={`update.post_logout_redirect_uris.${index}`}
                    placeholder="https://app.com/logout"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => postLogoutRedirectUris.remove(index)}
                    className="self-end"
                  >
                    <Trash size={16} />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => postLogoutRedirectUris.append("" as never)}
                className="flex items-center gap-2"
              >
                <Plus size={16} />
                Add Logout URI
              </Button>
            </div>
          </Field>
        </FieldSet>
      </FieldGroup>

      {/* OAuth Config */}
      <FieldGroup>
        <FieldSet>
          <FieldLegend>OAuth Configuration</FieldLegend>
          <FieldGroup className="grid sm:grid-cols-2 gap-4">
            <FormSelect
              control={form.control}
              name="update.type"
              label="Client Type"
              placeholder="Select type"
              className="w-full"
            >
              <SelectItem value="web">Web</SelectItem>
              <SelectItem value="native">Native</SelectItem>
              <SelectItem value="user-agent-based">SPA</SelectItem>
            </FormSelect>
          </FieldGroup>
        </FieldSet>
      </FieldGroup>

      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" size="sm" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </DialogClose>
        <Button disabled={isSubmitting} size="sm" type="submit">
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" /> Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </DialogFooter>
    </form>
  );
}
