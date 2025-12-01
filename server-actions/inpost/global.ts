export function getInpostHeaders() {
  return {
    Authorization: `Bearer ${process.env.INPOST_API_SHIPX}`,
  };
}
