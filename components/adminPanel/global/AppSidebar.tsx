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
import LinkText from "../../global/LinkText";

export default function AppSidebar() {
  return (
    <Sidebar className="bg-sidebar-background ">
      <SidebarHeader>
        <LinkText href="/admin-panel/">
          <h1 className="text-2xl font-medium px-3 py-2">Admin Panel</h1>
        </LinkText>
      </SidebarHeader>
      <SidebarContent className="px-3">
        <SidebarGroup>
          <SidebarGroupLabel>Produkty</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <LinkText href="/admin-panel/create">
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
            <SidebarMenuItem>
              <LinkText href="/admin-panel/brands">Marki</LinkText>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <LinkText href="/admin-panel/categories">Kategorie</LinkText>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Sprzedaż</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <LinkText href="/admin-panel/orders">Zamówienia</LinkText>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <LinkText href="/admin-panel/returns">Zwroty</LinkText>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
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
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter></SidebarFooter>
    </Sidebar>
  );
}
