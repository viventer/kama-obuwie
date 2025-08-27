export default async function layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="my-20 mx-auto w-[90%] max-w-[1440px] pb-8">
      {children}
    </main>
  );
}
