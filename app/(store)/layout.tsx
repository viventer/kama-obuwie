import Footer from "@/components/store/global/Footer";
import Header from "@/components/store/global/Header";
import MainNav from "@/components/store/global/MainNav";
import { ShoppingCartProvider } from "@/app/providers/ShoppingCartProvider";
import { StoreSearchProvider } from "@/components/store/search/StoreSearchContext";
import MainNavBar from "@/components/store/search/MainNavBar";
import StoreSearchOverlay from "@/components/store/search/StoreSearchOverlay";
import StoreShell from "@/components/store/search/StoreShell";

export default async function layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ShoppingCartProvider>
      <StoreSearchProvider>
        <StoreShell>
          <div className="sticky top-0 z-100 left-0 right-0">
            <Header />
            <MainNavBar>
              <MainNav />
            </MainNavBar>
          </div>
          <StoreSearchOverlay />
          <main className="flex-1 mt-4 mb-32 mx-auto w-[90vw] max-w-[1440px]">
            {children}
          </main>
          <Footer />
        </StoreShell>
      </StoreSearchProvider>
    </ShoppingCartProvider>
  );
}
