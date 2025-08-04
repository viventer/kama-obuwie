"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { OrderWithId } from "@/firebase/schemas/ordersSchemas";
import { PickupProposal } from "@/firebase/schemas/shipmentsSchemas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Label } from "@/components/ui/label";
import { FormEvent } from "react";
import { useFullPageLoading } from "../../global/FullPageLoader";
import { useToast } from "@/hooks/useToast";
import { useRouter } from "next/navigation";
import axios from "axios";
import { PickupRequestBody } from "@/app/api/allegro/shipment-management/pickup/route";
import { AllegroSalesChannel } from "@/lib/constants";
import { useErrorHandler } from "@/hooks/useErrorHandler";

const requestPickupSchema = z.object({
  pickupDateProposalId: z.string().min(1, "Musisz wybrać datę podjazdu"),
});

type RequestPickupFormData = z.infer<typeof requestPickupSchema>;

export default function RequestPickupForm({
  shipmentData,
  pickupProposals,
  shipmentId,
  orderId,
  salesChannel,
}: {
  shipmentData: OrderWithId["shipment"];
  pickupProposals: PickupProposal[];
  shipmentId: string;
  orderId: string;
  salesChannel: AllegroSalesChannel;
}) {
  const form = useForm<RequestPickupFormData>({
    resolver: zodResolver(requestPickupSchema),
    defaultValues: {
      pickupDateProposalId: "",
    },
  });

  const { startLoading, stopLoading } = useFullPageLoading();
  const { showToast } = useToast();
  const { handleError } = useErrorHandler();
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    startLoading();

    const data = form.getValues();
    const requestData: PickupRequestBody = {
      shipmentId,
      pickupDateProposalId: data.pickupDateProposalId,
      salesChannel,
      orderId,
    };

    try {
      await axios.post("/api/allegro/shipment-management/pickup", requestData);
      showToast("Podjazd kuriera został zamówiony pomyślnie.", "success");
      router.replace(`/admin-panel/orders/processing`);
    } catch (err: any) {
      handleError(
        err,
        "Wystąpił nieoczekiwany błąd podczas tworzenia etykiety"
      );
    } finally {
      stopLoading();
    }
  };

  const handleReject = (e: FormEvent) => {
    e.preventDefault();

    showToast("Podjazd został już zamówiony", "default");

    router.replace(`/admin-panel/orders/processing`);
  };

  return (
    <Form {...form}>
      <FormField
        control={form.control}
        name="pickupDateProposalId"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel className="font-medium text-lg">
              Wybierz datę podjazdu kuriera
            </FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className="flex flex-col space-y-2"
              >
                {pickupProposals.map((proposal) => (
                  <div
                    key={proposal.id}
                    className="flex items-center space-x-3"
                  >
                    <RadioGroupItem value={proposal.id} id={proposal.id} />
                    <Label
                      htmlFor={proposal.id}
                      className="font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer text-md"
                    >
                      <div className="flex flex-col">
                        <span>{proposal.name}</span>
                        {proposal.description && (
                          <span className="text-xs text-muted-foreground">
                            {proposal.description}
                          </span>
                        )}
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="flex mt-8 gap-4">
        <Button onClick={(e) => handleSubmit(e)} className="w-fit">
          Zamów podjazd
        </Button>
        <Button
          onClick={(e) => handleReject(e)}
          className="w-fit"
          variant={"ghost"}
        >
          Podjazd został już zamówiony
        </Button>
      </div>
    </Form>
  );
}
