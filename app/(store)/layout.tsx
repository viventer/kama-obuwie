import Header from "@/components/store/global/Header";
import MainNav from "@/components/store/global/MainNav";

export default async function layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <div className="bg-card py-2 flex justify-center">
        <MainNav />
      </div>
      <main className="my-20 mx-auto w-[90%] max-w-[1440px] pb-8 overflow-auto scrollbar  [scrollbar-gutter:stable]">
        {children}
      </main>
    </>
  );
}
