"use client";

import { createBusinessInfo, updateBusinessInfo } from "@/actions/admin/business-info-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { businessInfoSchema, type BusinessInfoValues } from "@/lib/validations/business-info";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm, type Resolver } from "react-hook-form";

interface BusinessInfoFormProps {
   initialData?: BusinessInfoValues | null;
   onSuccess?: () => void;
   onCancel?: () => void;
}

export function BusinessInfoForm({ initialData, onSuccess, onCancel }: BusinessInfoFormProps) {
   const router = useRouter();
   const isEditing = !!initialData?.id;

   const { executeAsync: executeCreate, status: createStatus } = useAction(createBusinessInfo);
   const { executeAsync: executeUpdate, status: updateStatus } = useAction(updateBusinessInfo);

   const isLoading = createStatus === "executing" || updateStatus === "executing";

   const form = useForm<BusinessInfoValues>({
      resolver: zodResolver(businessInfoSchema) as unknown as Resolver<BusinessInfoValues>,
      defaultValues: {
         name: initialData?.name || "",
         logoSrc: initialData?.logoSrc || "",
         bannerSrc: initialData?.bannerSrc || "",
         logoAlt: initialData?.logoAlt || "",
         bannerAlt: initialData?.bannerAlt || "",
         businessHours: initialData?.businessHours || "",
         address: {
            street: initialData?.address?.street || "",
            city: initialData?.address?.city || "",
            state: initialData?.address?.state || "",
            postalCode: initialData?.address?.postalCode || "",
            country: initialData?.address?.country || "",
         },
         phone: (initialData?.phone || []) as any,
         email: (initialData?.email || []) as any,
         website: initialData?.website || "",
         facebook: initialData?.facebook || "",
         twitter: initialData?.twitter || "",
         instagram: initialData?.instagram || "",
         youtube: initialData?.youtube || "",
         id: initialData?.id,
      },
   });

   const { fields: phoneFields, append: appendPhone, remove: removePhone } = useFieldArray({
      control: form.control,
      name: "phone",
   });

   const { fields: emailFields, append: appendEmail, remove: removeEmail } = useFieldArray({
      control: form.control,
      name: "email",
   });

   async function onSubmit(values: BusinessInfoValues) {
      const sanitizedValues = {
         ...values,
         // If address matches default empty object, send undefined to be clean, or keep as is if backend handles it.
         // Zod optional() accepts undefined.
         address: (values.address && Object.values(values.address).some(v => v)) ? values.address : undefined,
      } as BusinessInfoValues;

      if (isEditing) {
         await executeUpdate(sanitizedValues);
      } else {
         await executeCreate(sanitizedValues);
      }
      // Simple success handling
      onSuccess?.();
      router.refresh();
   }

   return (
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-1">
         <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
               <div className="space-y-2">
                  <Label htmlFor="name">Business Name</Label>
                  <Input id="name" {...form.register("name")} placeholder="My Company" />
                  {form.formState.errors.name && (
                     <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                  )}
               </div>
               <div className="space-y-2">
                  <Label htmlFor="businessHours">Business Hours</Label>
                  <Input id="businessHours" {...form.register("businessHours")} placeholder="Mon-Fri 9-5" />
               </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
               <div className="space-y-2">
                  <Label htmlFor="logoSrc">Logo URL</Label>
                  <Input id="logoSrc" {...form.register("logoSrc")} placeholder="https://..." />
                  {form.formState.errors.logoSrc && (
                     <p className="text-sm text-destructive">{form.formState.errors.logoSrc.message}</p>
                  )}
               </div>
               <div className="space-y-2">
                  <Label htmlFor="bannerSrc">Banner URL</Label>
                  <Input id="bannerSrc" {...form.register("bannerSrc")} placeholder="https://..." />
               </div>
            </div>

            <Separator />

            {/* Address Section */}
            <div className="space-y-2">
               <h3 className="text-lg font-medium">Address</h3>
               <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                     <Label>Street</Label>
                     <Input {...form.register("address.street")} placeholder="123 Main Road" />
                  </div>
                  <div className="space-y-2">
                     <Label>City</Label>
                     <Input {...form.register("address.city")} placeholder="Dhaka" />
                  </div>
                  <div className="space-y-2">
                     <Label>State</Label>
                     <Input {...form.register("address.state")} placeholder="Dhaka" />
                  </div>
                  <div className="space-y-2">
                     <Label>Postal Code</Label>
                     <Input {...form.register("address.postalCode")} placeholder="1200" />
                  </div>
                  <div className="space-y-2">
                     <Label>Country</Label>
                     <Input {...form.register("address.country")} placeholder="Bangladesh" />
                  </div>
               </div>
            </div>

            <Separator />

            {/* Contacts */}
            <div className="grid gap-6 md:grid-cols-2">
               <div className="space-y-2">
                  <div className="flex items-center justify-between">
                     <h3 className="text-lg font-medium">Phones</h3>
                     <Button type="button" variant="outline" size="sm" onClick={() => appendPhone({ value: "", label: "Main", isPrimary: false })}>
                        <Plus className="h-4 w-4 mr-1" /> Add
                     </Button>
                  </div>
                  {phoneFields.map((field, index) => (
                     <div key={field.id} className="flex gap-2 items-end">
                        <div className="flex-1 space-y-1">
                           {index === 0 && <Label className="text-xs">Label</Label>}
                           <Input {...form.register(`phone.${index}.label`)} placeholder="Main" />
                        </div>
                        <div className="flex-2 space-y-1">
                           {index === 0 && <Label className="text-xs">Number</Label>}
                           <Input {...form.register(`phone.${index}.value`)} placeholder="+1 234..." />
                           {form.formState.errors.phone?.[index]?.value && (
                              <p className="text-xs text-destructive">{form.formState.errors.phone[index]?.value?.message}</p>
                           )}
                        </div>
                        <Button type="button" variant="ghost" size="icon" onClick={() => removePhone(index)} className="text-destructive">
                           <Trash2 className="h-4 w-4" />
                        </Button>
                     </div>
                  ))}
               </div>

               <div className="space-y-2">
                  <div className="flex items-center justify-between">
                     <h3 className="text-lg font-medium">Emails</h3>
                     <Button type="button" variant="outline" size="sm" onClick={() => appendEmail({ value: "", label: "Support", isPrimary: false })}>
                        <Plus className="h-4 w-4 mr-1" /> Add
                     </Button>
                  </div>
                  {emailFields.map((field, index) => (
                     <div key={field.id} className="flex gap-2 items-end">
                        <div className="flex-1 space-y-1">
                           {index === 0 && <Label className="text-xs">Label</Label>}
                           <Input {...form.register(`email.${index}.label`)} placeholder="Support" />
                        </div>
                        <div className="flex-2 space-y-1">
                           {index === 0 && <Label className="text-xs">Email</Label>}
                           <Input {...form.register(`email.${index}.value`)} placeholder="support@example.com" />
                           {form.formState.errors.email?.[index]?.value && (
                              <p className="text-xs text-destructive">{form.formState.errors.email[index]?.value?.message}</p>
                           )}
                        </div>
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeEmail(index)} className="text-destructive">
                           <Trash2 className="h-4 w-4" />
                        </Button>
                     </div>
                  ))}
               </div>
            </div>

            <Separator />

            {/* Socials */}
            <div className="space-y-2">
               <h3 className="text-lg font-medium">Social Media</h3>
               <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                     <Label>Website</Label>
                     <Input {...form.register("website")} placeholder="https://" />
                  </div>
                  <div className="space-y-2">
                     <Label>Facebook</Label>
                     <Input {...form.register("facebook")} placeholder="https://facebook.com/..." />
                  </div>
                  <div className="space-y-2">
                     <Label>Twitter (X)</Label>
                     <Input {...form.register("twitter")} placeholder="https://twitter.com/..." />
                  </div>
                  <div className="space-y-2">
                     <Label>Instagram</Label>
                     <Input {...form.register("instagram")} placeholder="https://instagram.com/..." />
                  </div>
                  <div className="space-y-2">
                     <Label>YouTube</Label>
                     <Input {...form.register("youtube")} placeholder="https://youtube.com/..." />
                  </div>
               </div>
            </div>

         </div>

         <div className="flex justify-end gap-3 pt-4">
            {onCancel && (
               <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                  Cancel
               </Button>
            )}
            <Button type="submit" disabled={isLoading}>
               {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
               {isEditing ? "Update Business Info" : "Create Business Info"}
            </Button>
         </div>
      </form>
   );
}
