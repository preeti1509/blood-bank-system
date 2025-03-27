import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { z } from "zod";
import { insertRecipientSchema, bloodTypeEnum } from "@shared/schema";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Extend the schema with additional validation
const formSchema = insertRecipientSchema.extend({
  dateOfBirth: z.date({
    required_error: "Date of birth is required",
  }),
});

type RecipientFormValues = z.infer<typeof formSchema>;

interface RecipientFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
  onCancel: () => void;
  defaultValues?: Partial<RecipientFormValues>;
  onSuccess?: () => void;
  isEdit?: boolean;
  recipientId?: number;
}

export function RecipientForm({
  initialData,
  onSubmit: submitHandler,
  isSubmitting,
  onCancel,
  defaultValues,
  onSuccess,
  isEdit = false,
  recipientId,
}: RecipientFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get hospitals list for dropdown
  const { data: hospitals } = useQuery({
    queryKey: ['/api/hospitals'],
  });

  // Set up form with default values
  const form = useForm<RecipientFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      bloodType: "O+",
      dateOfBirth: undefined,
      gender: "",
      phone: "",
      email: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      hospitalId: undefined,
      medicalHistory: "",
      active: true,
      ...defaultValues,
    },
  });

  // Create mutation for recipient creation/update
  const mutation = useMutation({
    mutationFn: async (values: RecipientFormValues) => {
      if (isEdit && recipientId) {
        // Update existing recipient
        const response = await apiRequest(
          "PATCH",
          `/api/recipients/${recipientId}`,
          values
        );
        return response.json();
      } else {
        // Create new recipient
        const response = await apiRequest("POST", "/api/recipients", values);
        return response.json();
      }
    },
    onSuccess: () => {
      toast({
        title: isEdit ? "Recipient updated" : "Recipient created",
        description: isEdit
          ? "The recipient has been updated successfully."
          : "A new recipient has been added to the system.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/recipients"] });
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${isEdit ? "update" : "create"} recipient: ${
          error.message
        }`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: RecipientFormValues) => {
    if (submitHandler) {
      submitHandler(values);
    } else {
      mutation.mutate(values);
    }
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
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bloodType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Blood Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Blood Type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {bloodTypeEnum.options.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
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
              <FormItem className="flex flex-col">
                <FormLabel>Date of Birth</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
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
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Gender" />
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
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="(555) 123-4567" {...field} />
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
                  <Input placeholder="john.doe@example.com" {...field} />
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
            name="hospitalId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Associated Hospital (Optional)</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  defaultValue={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Hospital" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {hospitals?.map((hospital) => (
                      <SelectItem 
                        key={hospital.id} 
                        value={hospital.id.toString()}
                      >
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

        <FormField
          control={form.control}
          name="medicalHistory"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Medical History (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any relevant medical history or conditions..."
                  className="h-24"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel || (() => onSuccess && onSuccess())}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || mutation.isPending}>
            {isSubmitting || mutation.isPending ? "Saving..." : isEdit ? "Update Recipient" : "Add Recipient"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
