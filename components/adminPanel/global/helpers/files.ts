export const getNewFileName = (fileName: string) => {
  const ext = fileName.split(".").pop() ?? "jpg";
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const random = Math.floor(Math.random() * 1e6);
  const newFileName = `${timestamp}_${random}.${ext}`;

  return newFileName;
};
