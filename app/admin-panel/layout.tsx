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
      <SidebarTrigger className="mt-4 ml-4 absolute md:sticky top-4 left-0 z-50" />
      <main className="my-20 mx-auto w-[90%] max-w-[1440px] pb-8">
        {children}
      </main>
    </SidebarProvider>
  );
}
