import Footer from "@/components/store/global/Footer";
import Header from "@/components/store/global/Header";
import MainNav from "@/components/store/global/MainNav";
import { ShoppingCartProvider } from "@/app/providers/ShoppingCartProvider";

export default async function layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ShoppingCartProvider>
      <div className="min-h-screen flex flex-col">
        <div className="sticky top-0 z-100 left-0 right-0">
          <Header />
          <div className="bg-card py-2 flex justify-center">
            <MainNav />
          </div>
        </div>
        <main className="flex-1 my-2 mx-auto w-[90%] max-w-[1440px] overflow-auto scrollbar pb-6">
          {children}
        </main>
        <Footer />
      </div>
    </ShoppingCartProvider>
  );
}
