import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { z } from "zod";
import { insertRequestSchema, BLOOD_TYPES } from "@shared/schema";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { generateRequestId } from "@/lib/utils";
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
const formSchema = insertRequestSchema.extend({
  bloodType: z.enum(BLOOD_TYPES),
  units: z.number().min(1, {
    message: "At least 1 unit must be requested.",
  }),
  urgency: z.enum(["normal", "urgent", "critical"]),
  status: z.enum(["pending", "approved", "fulfilled", "cancelled"]),
  requestDate: z.date({
    required_error: "Request date is required",
  }),
  requiredBy: z.date().optional(),
  contactName: z.string().min(2, {
    message: "Contact name must be at least 2 characters.",
  }),
  contactPhone: z.string().min(10, {
    message: "Contact phone must be at least 10 characters.",
  }),
});

type RequestFormValues = z.infer<typeof formSchema>;

interface RequestFormProps {
  defaultValues?: Partial<RequestFormValues>;
  onSuccess?: () => void;
  isEdit?: boolean;
  requestId?: number;
}

export function RequestForm({
  defaultValues,
  onSuccess,
  isEdit = false,
  requestId,
}: RequestFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get hospitals list for dropdown
  const { data: hospitals } = useQuery({
    queryKey: ['/api/hospitals'],
  });

  // Set up form with default values
  const form = useForm<RequestFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      requestId: generateRequestId(),
      hospitalId: undefined,
      bloodType: "O+",
      units: 1,
      urgency: "normal",
      status: "pending",
      requestDate: new Date(),
      requiredBy: undefined,
      patientDetails: "",
      contactName: "",
      contactPhone: "",
      notes: "",
      transactionId: null,
      ...defaultValues,
    },
  });

  // Create mutation for request creation/update
  const mutation = useMutation({
    mutationFn: async (values: RequestFormValues) => {
      if (isEdit && requestId) {
        // Update existing request
        const response = await apiRequest(
          "PATCH",
          `/api/requests/${requestId}`,
          values
        );
        return response.json();
      } else {
        // Create new request
        const response = await apiRequest("POST", "/api/requests", values);
        return response.json();
      }
    },
    onSuccess: () => {
      toast({
        title: isEdit ? "Request updated" : "Request created",
        description: isEdit
          ? "The blood request has been updated successfully."
          : "A new blood request has been added to the system.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/requests"] });
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${isEdit ? "update" : "create"} request: ${
          error.message
        }`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: RequestFormValues) => {
    mutation.mutate(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="hospitalId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hospital</FormLabel>
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
                    {BLOOD_TYPES.map((type) => (
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
            name="units"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Units Required</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min={1}
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="urgency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Urgency</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Urgency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="requiredBy"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Required By (Optional)</FormLabel>
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
                      disabled={(date) => date < new Date()}
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
            name="patientDetails"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Patient Details (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Brief information about the patient (age, gender, reason for transfusion)"
                    className="h-20"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Additional Notes (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Any additional information about this request"
                    className="h-20"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onSuccess && onSuccess()}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Saving..." : isEdit ? "Update Request" : "Submit Request"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
