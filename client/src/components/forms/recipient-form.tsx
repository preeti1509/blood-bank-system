import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { bloodTypeEnum, insertRecipientSchema } from "@shared/schema";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { format, parseISO } from "date-fns";

const formSchema = insertRecipientSchema.extend({
  dateOfBirth: z.string().min(1, "Date of birth is required"),
});

type RecipientFormValues = z.infer<typeof formSchema>;

interface RecipientFormProps {
  defaultValues?: Partial<RecipientFormValues>;
  onSuccess?: () => void;
  isEdit?: boolean;
  recipientId?: number;
}

export function RecipientForm({
  defaultValues,
  onSuccess,
  isEdit = false,
  recipientId,
}: RecipientFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch hospitals for dropdown
  const { data: hospitals } = useQuery({
    queryKey: ['/api/hospitals'],
  });

  const form = useForm<RecipientFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      gender: "",
      blood_type: "",
      date_of_birth: "",
      phone: "",
      email: "",
      address: "",
      city: "",
      state: "",
      zip: "",
      hospital_id: undefined,
      medical_notes: "",
      ...defaultValues,
    },
  });

  const createRecipientMutation = useMutation({
    mutationFn: async (values: RecipientFormValues) => {
      // Convert string date to ISO format
      const formattedValues = {
        ...values,
        date_of_birth: new Date(values.dateOfBirth).toISOString(),
      };
      
      const response = await apiRequest('POST', '/api/recipients', formattedValues);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Recipient has been created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/recipients'] });
      form.reset();
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create recipient: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const updateRecipientMutation = useMutation({
    mutationFn: async (values: RecipientFormValues) => {
      // Convert string date to ISO format
      const formattedValues = {
        ...values,
        date_of_birth: new Date(values.dateOfBirth).toISOString(),
      };
      
      const response = await apiRequest('PATCH', `/api/recipients/${recipientId}`, formattedValues);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Recipient has been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/recipients'] });
      queryClient.invalidateQueries({ queryKey: [`/api/recipients/${recipientId}`] });
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update recipient: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: RecipientFormValues) => {
    if (isEdit && recipientId) {
      updateRecipientMutation.mutate(values);
    } else {
      createRecipientMutation.mutate(values);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="First name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Last name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gender</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="blood_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Blood Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select blood type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {bloodTypeEnum.options.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="dateOfBirth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date of Birth</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input placeholder="Phone number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Email address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="hospital_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hospital (Optional)</FormLabel>
                <Select 
                  onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)}
                  defaultValue={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select hospital" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {hospitals?.map((hospital) => (
                      <SelectItem key={hospital.id} value={hospital.id.toString()}>
                        {hospital.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Street address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="City" {...field} />
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
                  <FormLabel>State (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="State" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="zip"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ZIP (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="ZIP code" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="medical_notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Medical Notes (Optional)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Add any relevant medical notes or history" 
                    className="min-h-[100px]"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-end gap-2">
          <Button type="submit" disabled={createRecipientMutation.isPending || updateRecipientMutation.isPending}>
            {createRecipientMutation.isPending || updateRecipientMutation.isPending 
              ? "Saving..." 
              : isEdit ? "Update Recipient" : "Add Recipient"
            }
          </Button>
        </div>
      </form>
    </Form>
  );
}