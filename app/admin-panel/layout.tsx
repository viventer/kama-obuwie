import AppSidebar from "@/components/adminPanel/global/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

export default async function layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <SidebarTrigger className="mt-4 ml-4 absolute left-0 md:static" />
      <main className="my-12 mx-auto w-[90%] max-w-[1440px]">{children}</main>
    </SidebarProvider>
  );
}
