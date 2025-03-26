import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertHospitalSchema } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

// Extend the schema with additional validation
const formSchema = insertHospitalSchema.extend({
  name: z.string().min(2, {
    message: "Hospital name must be at least 2 characters.",
  }),
  contactPhone: z.string().min(10, {
    message: "Contact phone number must be at least 10 characters.",
  }),
  contactEmail: z.string().email({
    message: "Please enter a valid email address.",
  }),
});

type HospitalFormValues = z.infer<typeof formSchema>;

interface HospitalFormProps {
  defaultValues?: Partial<HospitalFormValues>;
  onSuccess?: () => void;
  isEdit?: boolean;
  hospitalId?: number;
}

export function HospitalForm({
  defaultValues,
  onSuccess,
  isEdit = false,
  hospitalId,
}: HospitalFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Set up form with default values
  const form = useForm<HospitalFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      contactName: "",
      contactPhone: "",
      contactEmail: "",
      active: true,
      ...defaultValues,
    },
  });

  // Create mutation for hospital creation/update
  const mutation = useMutation({
    mutationFn: async (values: HospitalFormValues) => {
      if (isEdit && hospitalId) {
        // Update existing hospital
        const response = await apiRequest(
          "PATCH",
          `/api/hospitals/${hospitalId}`,
          values
        );
        return response.json();
      } else {
        // Create new hospital
        const response = await apiRequest("POST", "/api/hospitals", values);
        return response.json();
      }
    },
    onSuccess: () => {
      toast({
        title: isEdit ? "Hospital updated" : "Hospital created",
        description: isEdit
          ? "The hospital has been updated successfully."
          : "A new hospital has been added to the system.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/hospitals"] });
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${isEdit ? "update" : "create"} hospital: ${
          error.message
        }`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: HospitalFormValues) => {
    mutation.mutate(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hospital Name</FormLabel>
                <FormControl>
                  <Input placeholder="Memorial Hospital" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input placeholder="123 Main St" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input placeholder="Cityville" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State</FormLabel>
                <FormControl>
                  <Input placeholder="CA" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="zipCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>ZIP Code</FormLabel>
                <FormControl>
                  <Input placeholder="90210" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contactName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Person</FormLabel>
                <FormControl>
                  <Input placeholder="Dr. Sarah Johnson" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contactPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Phone</FormLabel>
                <FormControl>
                  <Input placeholder="(555) 123-4567" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contactEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Email</FormLabel>
                <FormControl>
                  <Input placeholder="sjohnson@hospital.org" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Active</FormLabel>
                <p className="text-sm text-gray-500">
                  Is this hospital currently active and connected to the blood bank system?
                </p>
              </div>
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onSuccess && onSuccess()}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Saving..." : isEdit ? "Update Hospital" : "Add Hospital"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
