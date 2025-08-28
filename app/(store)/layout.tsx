import Header from "@/components/store/global/Header";

export default async function layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="my-20 mx-auto w-[90%] max-w-[1440px] pb-8 overflow-auto scrollbar  [scrollbar-gutter:stable]">
        {children}
      </main>
    </>
  );
}
