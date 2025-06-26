export type AllegroHeaders = {
  "Content-Type": string;
  Accept: string;
  "Accept-Language": string;
  Authorization: string;
};

export const getAllegroHeaders = (accessToken: string): AllegroHeaders => {
  const headers = {
    "Content-Type": "application/vnd.allegro.public.v1+json",
    Accept: "application/vnd.allegro.public.v1+json",
    "Accept-Language": "pl-PL",
    Authorization: `Bearer ${accessToken}`,
  };

  return headers;
};
