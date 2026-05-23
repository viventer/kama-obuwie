export type AllegroHeaders = {
  "Content-Type": string;
  Accept: string;
  "Accept-Language": string;
  Authorization: string;
  "User-Agent": string;
};

export type AllegroHeadersMap = {
  AL1: AllegroHeaders;
  AL2: AllegroHeaders;
};

export const getAllegroHeaders = (
  AL1AccessToken: string,
  AL2AccessToken: string,
): AllegroHeadersMap => {
  const AL1Headers = {
    "Content-Type": "application/vnd.allegro.public.v1+json",
    Accept: "application/vnd.allegro.public.v1+json",
    "Accept-Language": "pl-PL",
    Authorization: `Bearer ${AL1AccessToken}`,
    "User-Agent": process.env.ALLEGRO_USER_AGENT!,
  };

  const AL2Headers = {
    ...AL1Headers,
    Authorization: `Bearer ${AL2AccessToken}`,
    "User-Agent": process.env.ALLEGRO_USER_AGENT!,
  };

  return {
    AL1: AL1Headers,
    AL2: AL2Headers,
  };
};

// Pomocnicza funkcja dla kompatybilności wstecznej - zwraca nagłówki dla jednego konta
export const getSingleAllegroHeaders = (
  accessToken: string,
): AllegroHeaders => {
  return {
    "Content-Type": "application/vnd.allegro.public.v1+json",
    Accept: "application/vnd.allegro.public.v1+json",
    "Accept-Language": "pl-PL",
    Authorization: `Bearer ${accessToken}`,
    "User-Agent": process.env.ALLEGRO_USER_AGENT!,
  };
};
