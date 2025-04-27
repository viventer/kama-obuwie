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

export default function AppSidebar() {
  return (
    <Sidebar className="bg-sidebar-background ">
      <SidebarHeader>
        <LinkText href="/">
          <h1 className="text-2xl font-medium px-3 py-2">Admin Panel</h1>
        </LinkText>
      </SidebarHeader>
      <SidebarContent className="px-3">
        <SidebarGroup>
          <SidebarGroupLabel>Produkty</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <LinkText href="/create">Tworzenie produktów</LinkText>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <LinkText href="/assortment">Zarządzanie asortymentem</LinkText>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <LinkText href="/sizing-tables">Tabele rozmiarów</LinkText>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <LinkText href="/brands">Marki</LinkText>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <LinkText href="/categories">Kategorie</LinkText>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Sprzedaż</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <LinkText href="/orders">Zamówienia</LinkText>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <LinkText href="/returns">Zwroty</LinkText>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Szablony</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <LinkText href="/templates/description">Szablony opisów</LinkText>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <LinkText href="/templates/message">Szablony wiadomości</LinkText>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Konfiguracja</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <LinkText href="/package-dimensions">Wymiary paczek</LinkText>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Administracja</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <LinkText href="/users">Zarządzanie użytkownikami</LinkText>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <LinkText href="/error-reports">Zgłoszenia błędów</LinkText>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Pozostałe</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <LinkText href="/net-profit-calc">
                Kalkulator zysku netto
              </LinkText>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter></SidebarFooter>
    </Sidebar>
  );
}
