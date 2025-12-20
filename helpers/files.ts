export const getNewFileName = (fileName: string) => {
  const ext = fileName.split(".").pop() ?? "jpg";
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const random = Math.floor(Math.random() * 1e6);
  const newFileName = `${timestamp}_${random}.${ext}`;

  return newFileName;
};

export const getProductFolderPath = ({
  type,
  id,
  imagesType,
}: {
  type: string;
  id: string;
  imagesType: "raw" | "edited";
}) => {
  return `products/${imagesType}-photos/${type}/${id}`;
};

export const getProductDownloadName = ({
  manufacturerCode,
  imagesType,
}: {
  manufacturerCode: string;
  imagesType: "raw" | "edited";
}) => {
  const serializedManufacturerCode = manufacturerCode.replace(
    /[^a-zA-Z0-9]/g,
    "-"
  );
  return `${imagesType}-${serializedManufacturerCode}`;
};
