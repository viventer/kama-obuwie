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
          <div
            className="border-b-1 py-2 flex justify-center sm:px-[5%] bg-background"
            data-main-nav-bar
          >
            <MainNav />
          </div>
        </div>
        <main className="flex-1 mt-4 mb-16 mx-auto w-[90vw] max-w-[1440px] overflow-auto scrollbar">
          {children}
        </main>
        <Footer />
      </div>
    </ShoppingCartProvider>
  );
}
