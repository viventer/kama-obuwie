type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function page({ searchParams }: Props) {
  const categoryId = (await searchParams).categoryId as string | undefined;

  return (
    <div>
      <h1>Listing Page</h1>
      {categoryId ? <p>Category: {categoryId}</p> : <p>No category selected</p>}
    </div>
  );
}
