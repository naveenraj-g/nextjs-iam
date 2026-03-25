"use client";

import { useFormContext } from "react-hook-form";
import { SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { TAddMemberValidationSchema } from "@/modules/entities/schemas/admin/organizations/organizations.schema";
import { FormInput, FormSelect } from "@/modules/client/shared/custom-form-fields";

interface AddMemberFormProps {
  onSubmit: (data: TAddMemberValidationSchema) => Promise<void>;
  onCancel: () => void;
}

export function AddMemberForm({ onSubmit, onCancel }: AddMemberFormProps) {
  const form = useFormContext<TAddMemberValidationSchema>();
  const {
    control,
    formState: { isSubmitting },
  } = form;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <FormInput control={control} name="userId" label="User ID" placeholder="Enter user ID" />
      <FormSelect control={control} name="role" label="Role">
        <SelectItem value="member">Member</SelectItem>
        <SelectItem value="admin">Admin</SelectItem>
        <SelectItem value="owner">Owner</SelectItem>
      </FormSelect>

      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Add Member
        </Button>
      </DialogFooter>
    </form>
  );
}
