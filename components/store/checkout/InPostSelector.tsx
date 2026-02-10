"use client";

import { useEffect, useState, useRef } from "react";
import { InpostGeowidgetReact } from "inpost-geowidget-react";
import { UseFormReturn } from "react-hook-form";
import { CheckoutData } from "@/firebase/schemas/checkoutSchemas";
import Loader from "@/components/adminPanel/global/Loader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { XIcon } from "lucide-react";
import IconButton from "@/components/adminPanel/global/IconButton";

interface InPostSelectorProps {
  form: UseFormReturn<CheckoutData>;
  onPointSelect?: (point: any) => void;
}

interface PickupPoint {
  name: string;
  address: {
    line1: string;
    line2: string;
  };
  address_details: {
    buildingNumber: string;
    city: string;
    flat_number: string;
    post_code: string;
    province: string;
    street: string;
  };
  location_description: string;
  type: "parcel_locker" | "parcel_locker_superpop" | "pop";
  opening_hours: string;
}

export default function InPostSelector({
  form,
  onPointSelect,
}: InPostSelectorProps) {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showWidget, setShowWidget] = useState(true);

  const [selectedPickupPoint, setSelectedPickupPoint] =
    useState<PickupPoint | null>(null);

  const deliveryMethod = form.watch("deliveryMethod");

  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selectedPickupPoint) {
      setShowWidget(true);
    }
  }, [selectedPickupPoint]);

  useEffect(() => {
    if (showWidget && !selectedPickupPoint) {
      setTimeout(() => {
        widgetRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
          inline: "nearest",
        });
      }, 300);
    }
  }, [showWidget, selectedPickupPoint]);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/inpost/geowidget/token");
        const data = await response.json();

        if (response.ok) {
          setToken(data.token);
        } else {
          setError(data.error || "Błąd podczas ładowania tokena InPost");
        }
      } catch (err) {
        setError("Błąd podczas ładowania tokena InPost");
        console.error("Error fetching InPost token:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchToken();
  }, []);

  const handlePointSelect = (point: PickupPoint) => {
    form.setValue("pickupPoint", {
      id: point.name,
      name: point.name,
      description: point.location_description || null,
      address: {
        street: point.address_details?.street || "",
        city: point.address_details?.city || "",
        zipCode: point.address_details?.post_code || "",
        countryCode: "PL",
      },
    });

    setSelectedPickupPoint(point);

    setShowWidget(false);

    if (onPointSelect) {
      onPointSelect(point);
    }
  };

  const handleChangePoint = () => {
    setShowWidget(true);

    form.setValue("pickupPoint", undefined);

    setTimeout(() => {
      widgetRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });
    }, 100);
  };

  return (
    <div
      className={`space-y-4 w-full ${
        deliveryMethod == "courier" ? "hidden" : ""
      }`}
      ref={widgetRef}
    >
      <h3 className="text-xl">Punkt odbioru InPost</h3>

      {selectedPickupPoint && !showWidget ? (
        <Card className="p-4 max-w-xl border-brand">
          <div className="flex flex-col justify-between items-start">
            <p className="font-medium mb-1">{selectedPickupPoint.name}</p>
            <section>
              <p>ul. {selectedPickupPoint.address.line1}</p>
              <p className="mb-1">{selectedPickupPoint.address.line2}</p>
              <p className="mb-4">{selectedPickupPoint.location_description}</p>
            </section>
            <Button onClick={handleChangePoint}>Zmień</Button>
          </div>
        </Card>
      ) : !showWidget ? (
        <Card className="p-4 max-w-xl border-destructive">
          <div className="flex flex-col items-start gap-4">
            <h2 className="font-medium">Nie wybrano punktu odbioru</h2>
            <Button variant={"important"} onClick={() => setShowWidget(true)}>
              Wybierz
            </Button>
          </div>
        </Card>
      ) : (
        <div className="md:rounded-xs overflow-hidden md:aspect-[3/2] md:h-auto flex items-center justify-center fixed top-0 left-0 h-screen md:relative w-full z-100 backdrop-blur-md">
          <div className="absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]">
            <Loader />
          </div>
          {isLoading ? (
            <></>
          ) : error ? (
            <p className="text-destructive">{error}</p>
          ) : !token ? (
            <p className="text-destructive">
              Nie udało się załadować tokena InPost
            </p>
          ) : (
            <div className="z-10 w-full h-full ">
              <div className="flex justify-between w-full h-10 px-2 items-center bg-background fixed top-0 left-0 md:hidden">
                <h2 className="font-medium text-lg">Wybierz Paczkomat</h2>
                <IconButton
                  onClick={() => {
                    setShowWidget(false);
                  }}
                >
                  <XIcon className="size-6 text-destructive cursor-pointer hover:brightness-150 transition-all" />
                </IconButton>
              </div>
              <div className="pt-10 h-full md:pt-0">
                <InpostGeowidgetReact
                  token={token}
                  pointSelect={handlePointSelect}
                  sandbox={process.env.NEXT_PUBLIC_NODE_ENV === "development"}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
