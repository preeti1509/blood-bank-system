import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { z } from "zod";
import { insertTransactionSchema, BLOOD_TYPES } from "@shared/schema";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { generateTransactionId } from "@/lib/utils";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
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
import { CalendarIcon, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Extend the schema with additional validation
const formSchema = insertTransactionSchema.extend({
  transactionDate: z.date({
    required_error: "Transaction date is required",
  }),
  units: z.number().min(1, {
    message: "At least 1 unit must be transacted.",
  }),
});

type TransactionFormValues = z.infer<typeof formSchema>;

interface TransactionFormProps {
  defaultValues?: Partial<TransactionFormValues>;
  onSuccess?: () => void;
  isEdit?: boolean;
  transactionId?: number;
}

export function TransactionForm({
  defaultValues,
  onSuccess,
  isEdit = false,
  transactionId,
}: TransactionFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [transactionType, setTransactionType] = useState(defaultValues?.transactionType || "donation");

  // Get donors, hospitals and recipients for dropdowns
  const { data: donors } = useQuery({
    queryKey: ['/api/donors'],
  });

  const { data: hospitals } = useQuery({
    queryKey: ['/api/hospitals'],
  });

  const { data: recipients } = useQuery({
    queryKey: ['/api/recipients'],
    enabled: transactionType === "distribution",
  });

  // Get blood inventory stats
  const { data: inventoryStats } = useQuery({
    queryKey: ['/api/inventory/stats'],
  });

  // Set up form with default values
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      transactionId: generateTransactionId(),
      transactionDate: new Date(),
      transactionType: "donation",
      bloodType: "O+",
      units: 1,
      status: "pending",
      note: "",
      donorId: null,
      sourceHospitalId: null,
      recipientId: null,
      destinationHospitalId: null,
      createdById: 1, // Default admin user
      ...defaultValues,
    },
  });

  // Watch transaction type to show appropriate fields
  const watchTransactionType = form.watch("transactionType");
  const watchBloodType = form.watch("bloodType");
  const watchUnits = form.watch("units");

  // Update form fields when transaction type changes
  useEffect(() => {
    setTransactionType(watchTransactionType);

    // Reset fields based on transaction type
    if (watchTransactionType === "donation") {
      form.setValue("sourceHospitalId", null);
      form.setValue("recipientId", null);
    } else if (watchTransactionType === "distribution") {
      form.setValue("donorId", null);
      form.setValue("sourceHospitalId", null);
    } else if (watchTransactionType === "transfer") {
      form.setValue("donorId", null);
      form.setValue("recipientId", null);
    }
  }, [watchTransactionType, form]);

  // Check if there's enough inventory for distribution or transfer
  const inventoryCheck = () => {
    if ((watchTransactionType === "distribution" || watchTransactionType === "transfer") && 
        inventoryStats && watchBloodType) {
      const currentStock = inventoryStats[watchBloodType]?.units || 0;
      if (currentStock < watchUnits) {
        return {
          isValid: false,
          message: `Not enough ${watchBloodType} blood units in inventory. Available: ${currentStock}, Requested: ${watchUnits}.`
        };
      }
    }
    return { isValid: true };
  };

  // Create mutation for transaction creation/update
  const mutation = useMutation({
    mutationFn: async (values: TransactionFormValues) => {
      const check = inventoryCheck();
      if (!check.isValid) {
        throw new Error(check.message);
      }

      if (isEdit && transactionId) {
        // Update existing transaction
        const response = await apiRequest(
          "PATCH",
          `/api/transactions/${transactionId}`,
          values
        );
        return response.json();
      } else {
        // Create new transaction
        const response = await apiRequest("POST", "/api/transactions", values);
        return response.json();
      }
    },
    onSuccess: () => {
      toast({
        title: isEdit ? "Transaction updated" : "Transaction created",
        description: isEdit
          ? "The transaction has been updated successfully."
          : "A new transaction has been added to the system.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${isEdit ? "update" : "create"} transaction: ${
          error.message
        }`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: TransactionFormValues) => {
    mutation.mutate(values);
  };

  // Check inventory status
  const inventoryWarning = inventoryCheck();

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {!inventoryWarning.isValid && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Inventory Warning</AlertTitle>
            <AlertDescription>
              {inventoryWarning.message}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="transactionType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Transaction Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="donation">Donation</SelectItem>
                    <SelectItem value="distribution">Distribution</SelectItem>
                    <SelectItem value="transfer">Transfer</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  {field.value === "donation" 
                    ? "Blood received from donor"
                    : field.value === "distribution"
                    ? "Blood distributed to hospital/recipient"
                    : "Blood transferred between facilities"}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="transactionDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Transaction Date</FormLabel>
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
                <FormLabel>Units</FormLabel>
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
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Show donor field for donations */}
          {transactionType === "donation" && (
            <FormField
              control={form.control}
              name="donorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Donor</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Donor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {donors?.map((donor) => (
                        <SelectItem 
                          key={donor.id} 
                          value={donor.id.toString()}
                        >
                          {donor.name} ({donor.bloodType})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Show recipient field for distributions */}
          {transactionType === "distribution" && (
            <FormField
              control={form.control}
              name="recipientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipient</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Recipient" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {recipients?.map((recipient) => (
                        <SelectItem 
                          key={recipient.id} 
                          value={recipient.id.toString()}
                        >
                          {recipient.name} ({recipient.bloodType})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Show destination hospital field for distributions and transfers */}
          {(transactionType === "distribution" || transactionType === "transfer") && (
            <FormField
              control={form.control}
              name="destinationHospitalId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Destination Hospital</FormLabel>
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
          )}

          {/* Show source hospital field for transfers */}
          {transactionType === "transfer" && (
            <FormField
              control={form.control}
              name="sourceHospitalId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Source Hospital</FormLabel>
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
          )}
        </div>

        <FormField
          control={form.control}
          name="note"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any additional information about this transaction..."
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
            onClick={() => onSuccess && onSuccess()}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={mutation.isPending || !inventoryWarning.isValid}
          >
            {mutation.isPending 
              ? "Processing..." 
              : isEdit 
                ? "Update Transaction" 
                : `Create ${watchTransactionType.charAt(0).toUpperCase() + watchTransactionType.slice(1)}`
            }
          </Button>
        </div>
      </form>
    </Form>
  );
}
