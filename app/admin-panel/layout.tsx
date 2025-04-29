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
      <SidebarTrigger className="mt-4 ml-4" />
      <main className="my-12 mr-[5%] ml-0 md:mr-auto md:ml-auto w-[90%] max-w-[1440px]">
        {children}
      </main>
    </SidebarProvider>
  );
}
