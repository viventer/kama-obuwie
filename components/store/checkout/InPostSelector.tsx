"use client";

import { useEffect, useState, useRef } from "react";
import { InpostGeowidgetReact } from "inpost-geowidget-react";
import { UseFormReturn } from "react-hook-form";
import { CheckoutData } from "@/firebase/schemas/checkoutSchemas";
import Loader from "@/components/adminPanel/global/Loader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

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
        const response = await fetch("/api/inpost/token");
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
      className={`space-y-4 ${deliveryMethod == "courier" ? "hidden" : ""}`}
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
      ) : (
        // Wyświetl widget do wyboru punktu
        <div className="rounded-md overflow-hidden h-[75vh] flex items-center justify-center relative">
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
            <div className="z-10 w-full h-full">
              <InpostGeowidgetReact
                token={token}
                pointSelect={handlePointSelect}
                sandbox={true}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
