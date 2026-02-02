"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import LinkText from "./LinkText";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { redirect, useRouter } from "next/navigation";
import { useToast } from "@/hooks/useToast";
import { useUser } from "@/hooks/useUser";
import MiniLoader from "./MiniLoader";
import { LinkIcon } from "lucide-react";
import { useEffect, useState } from "react";

export default function AppSidebar() {
  const router = useRouter();
  const { showToast } = useToast();
  const { user, loading } = useUser();
  const { setOpen } = useSidebar();
  const [connectedAccounts, setConnectedAccounts] = useState<{
    AL1: boolean;
    AL2: boolean;
  } | null>(null);

  const handleLinkClick = () => {
    setOpen(false);
  };

  useEffect(() => {
    const fetchAllegroStatus = async () => {
      try {
        const response = await axios.get("/api/allegro/status");
        setConnectedAccounts(response.data);

        if (
          (!response.data.AL1 || !response.data.AL2) &&
          user?.role === "ADMIN"
        ) {
          redirect("/admin-auth/allegro-connect");
        }
      } catch (error) {
        redirect("/admin-auth/allegro-connect");
      }
    };

    if (user) {
      fetchAllegroStatus();
    }
  }, [user]);

  const logout = async () => {
    try {
      await axios.post("/api/auth/logout");
      router.push("/admin-auth/login");
      showToast("Pomyślnie wylogowano.", "success");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <Sidebar className="bg-sidebar-background">
      <SidebarHeader>
        <LinkText href="/admin-panel/" onClick={handleLinkClick}>
          <h1 className="text-2xl font-medium px-3 py-2">Admin Panel</h1>
        </LinkText>
      </SidebarHeader>
      <SidebarContent className="px-3 scrollbar">
        <SidebarGroup>
          <SidebarGroupLabel>Produkty</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <LinkText
                href="/admin-panel/create-products/new"
                onClick={handleLinkClick}
              >
                Tworzenie produktów
              </LinkText>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <LinkText href="/admin-panel/products" onClick={handleLinkClick}>
                Wystawione produkty
              </LinkText>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <LinkText
                href="/admin-panel/sizing-tables"
                onClick={handleLinkClick}
              >
                Tabele rozmiarów
              </LinkText>
            </SidebarMenuItem>
            {/* <SidebarMenuItem>
              <LinkText href="/admin-panel/brands">Marki</LinkText>
            </SidebarMenuItem> */}
            <SidebarMenuItem>
              <LinkText
                href="/admin-panel/categories"
                onClick={handleLinkClick}
              >
                Kategorie
              </LinkText>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Sprzedaż</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <LinkText href="/admin-panel/orders/new">Zamówienia</LinkText>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <LinkText href="/admin-panel/returns">Zwroty</LinkText>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Oferty</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <LinkText href="/admin-panel/offers">
                Zarządzanie ofertami
              </LinkText>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <LinkText href="/admin-panel/offers/sync">
                Synchronizacja z Allegro
              </LinkText>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <LinkText href="/admin-panel/offers/merchant-center">
                Google Merchant Center
              </LinkText>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        {/* <SidebarGroup>
          <SidebarGroupLabel>Szablony</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <LinkText href="/admin-panel/templates/description">
                Szablony opisów
              </LinkText>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <LinkText href="/admin-panel/templates/message">
                Szablony wiadomości
              </LinkText>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Konfiguracja</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <LinkText href="/admin-panel/package-dimensions">
                Wymiary paczek
              </LinkText>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Administracja</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <LinkText href="/admin-panel/users">
                Zarządzanie użytkownikami
              </LinkText>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <LinkText href="/admin-panel/error-reports">
                Zgłoszenia błędów
              </LinkText>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Pozostałe</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <LinkText href="/admin-panel/net-profit-calc">
                Kalkulator zysku netto
              </LinkText>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup> */}
      </SidebarContent>
      <SidebarFooter className="mb-4">
        {!loading && user ? (
          <div className="text-sm px-3 py-2">
            <p className="font-medium">{user.name || user.email}</p>
            <p className="opacity-75">
              Rola: {user.role?.toLowerCase() || "nieznana"}
            </p>
            {connectedAccounts?.AL1 && connectedAccounts?.AL2 ? (
              <div className="flex items-center gap-2 mt-4">
                <LinkIcon className="size-4 text-success" />
                <p className="font-medium">Podłączono konta Allegro</p>
              </div>
            ) : user.role === "ADMIN" ? (
              <div className="flex items-center gap-2 mt-4">
                <LinkIcon className="size-4 text-destructive" />
                <LinkText
                  href={`/admin-auth/allegro-connect`}
                  className="font-medium"
                  onClick={handleLinkClick}
                >
                  Połącz konta Allegro
                </LinkText>
              </div>
            ) : (
              <div className="flex items-center gap-2 mt-4">
                <LinkIcon className="text-destructive min-w-4" />
                <p>
                  <span className="font-medium">
                    Konta Allegro nie są połączone.
                  </span>{" "}
                  Skontaktuj się z administratorem.
                </p>
              </div>
            )}
          </div>
        ) : (
          <MiniLoader />
        )}
        <Button onClick={logout} variant={"destructive"}>
          Wyloguj się
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
