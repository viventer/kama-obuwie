type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function page({ searchParams }: Props) {
  const categoryName = (await searchParams).categoryName as string | undefined;

  return (
    <div>
      <h1>Listing Page</h1>
      {categoryName ? (
        <p>Category: {categoryName}</p>
      ) : (
        <p>No category selected</p>
      )}
    </div>
  );
}
