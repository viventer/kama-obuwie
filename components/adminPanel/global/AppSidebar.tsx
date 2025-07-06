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
} from "@/components/ui/sidebar";
import LinkText from "./LinkText";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/useToast";
import { useUser } from "@/hooks/useUser";
import MiniLoader from "./MiniLoader";
import { LinkIcon } from "lucide-react";

export default function AppSidebar() {
  const router = useRouter();
  const { showToast } = useToast();
  const { user, loading } = useUser();

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
        <LinkText href="/admin-panel/">
          <h1 className="text-2xl font-medium px-3 py-2">Admin Panel</h1>
        </LinkText>
      </SidebarHeader>
      <SidebarContent className="px-3 scrollbar">
        <SidebarGroup>
          <SidebarGroupLabel>Produkty</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <LinkText href="/admin-panel/create-products/new">
                Tworzenie produktów
              </LinkText>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <LinkText href="/admin-panel/assortment">
                Zarządzanie asortymentem
              </LinkText>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <LinkText href="/admin-panel/sizing-tables">
                Tabele rozmiarów
              </LinkText>
            </SidebarMenuItem>
            {/* <SidebarMenuItem>
              <LinkText href="/admin-panel/brands">Marki</LinkText>
            </SidebarMenuItem> */}
            <SidebarMenuItem>
              <LinkText href="/admin-panel/categories">Kategorie</LinkText>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        {/* <SidebarGroup>
          <SidebarGroupLabel>Sprzedaż</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <LinkText href="/admin-panel/orders">Zamówienia</LinkText>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <LinkText href="/admin-panel/returns">Zwroty</LinkText>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup> */}
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
            {user.connectedAccounts.AL1 && user.connectedAccounts.AL2 ? (
              <div className="flex items-center gap-2 mt-4">
                <LinkIcon className="size-4 text-success" />
                <p className="font-medium">Podłączono konta Allegro</p>
              </div>
            ) : (
              <div className="flex items-center gap-2 mt-4">
                <LinkIcon className="size-4 text-destructive" />
                <LinkText
                  href={`/admin-auth/allegro-connect`}
                  className="font-medium"
                >
                  Połącz konta Allegro
                </LinkText>
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
