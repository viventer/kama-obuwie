import { EmailOrderData } from "@/firebase/schemas/ordersSchemas";
import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

// W emailach muszą być pełne URL-e z domeną
const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL || "https://f57aba20dc1d.ngrok-free.app/";

// Kolory z globals.css (light theme - lepsze dla emaili)
const emailTailwindConfig = {
  theme: {
    extend: {
      colors: {
        background: "#e9edf0",
        foreground: "#1b1f22",
        text: "#1b1f22",
        primary: {
          DEFAULT: "#2e5e90",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#6b7280",
          foreground: "#ffffff",
        },
        accent: {
          DEFAULT: "#3b79b8",
          foreground: "#ffffff",
        },
        card: {
          DEFAULT: "#dae0e7",
          foreground: "#1b1f22",
        },
        muted: {
          DEFAULT: "#f3f4f6",
          foreground: "#6b7280",
        },
        border: "#d1d5db",
        input: "#ffffff",
        ring: "#2e5e90",
        destructive: {
          DEFAULT: "#d64545",
          foreground: "#ffffff",
        },
        success: {
          DEFAULT: "#79b83b",
          foreground: "#ffffff",
        },
        brand: "#3b79b8",
      },
    },
  },
};

const OrderCreated = ({
  emailOrderData,
}: {
  emailOrderData: EmailOrderData;
}) => (
  <Html>
    <Head />
    <Tailwind config={emailTailwindConfig}>
      <Body className="font-[ubuntu,roboto,arial,sans-serif] text-text text-base">
        <Preview>Zobacz dane dotyczące Twojego zamówienia</Preview>
        <Container className="my-[10px] mx-auto w-[600px] max-w-full border-2 border-primary rounded-lg">
          <Section className="py-10 px-[74px] text-center">
            <Img
              src={`${baseUrl}/branding/logo-banner.png`}
              width="300"
              alt="kama-obuwie"
              className="mx-auto"
            />
            <Heading className="text-[32px] mb-2">
              Dziękujemy za zamówienie!
            </Heading>
            <Text className="m-0 text-[14px] font-medium">
              {emailOrderData.orderDetails.status === "UNPAID"
                ? "Otrzymaliśmy Twoje zamówienie. Po otrzymaniu płatności rozpoczniemy jego realizację."
                : "Otrzymaliśmy Twoje zamówienie i rozpoczęliśmy jego realizację."}
            </Text>
          </Section>
          <Hr className="border m-0 border-primary/30" />
          <Section className="py-[20px] px-10">
            <Heading as="h3" className="mt-0 mb-2">
              Sprawdź aktualny status zamówienia
            </Heading>
            <Link
              href={`${baseUrl}/order-summary/${emailOrderData.orderDetails.id}`}
              className="border-primary border-2 text-primary font-medium px-3 py-1 rounded-md inline-block mb-6"
            >
              Szczegóły zamówienia
            </Link>
            {emailOrderData.orderDetails.status === "UNPAID" && (
              <>
                <Heading as="h3" className="mt-0 mb-2">
                  Płatność się nie powiodła?
                </Heading>
                <Link
                  href={`${baseUrl}/order-summary/${emailOrderData.orderDetails.id}`}
                  className="bg-primary border-2 border-primary text-white font-medium px-3 py-1 rounded-md inline-block"
                >
                  Ponów płatność
                </Link>
              </>
            )}
          </Section>
          <Hr className="border m-0 border-primary/30" />
          <Section className="py-[20px] px-10">
            <Heading as="h2" className="mb-2 mt-0">
              Dane dostawy
            </Heading>
            <Text className="mb-1 mt-0">
              <span className="font-bold">Email: </span>
              {emailOrderData.buyer.email}
            </Text>
            <Text className="mb-1 mt-0">
              <span className="font-bold">Nr telefonu: </span>
              {emailOrderData.buyer.phoneNumber}
            </Text>
            <Text className="mb-1 mt-0">
              <span className="font-bold">Metoda: </span>
              {emailOrderData.paymentType === "COD"
                ? "Kurier InPost Pobranie"
                : emailOrderData.delivery.method === "courier"
                  ? "Kurier InPost"
                  : "Paczkomat InPost"}
            </Text>
            {emailOrderData.delivery.address && (
              <Section>
                <Text className="mb-1 mt-0 font-bold">Adres:</Text>
                <Text>
                  {emailOrderData.delivery.address.zipCode}{" "}
                  {emailOrderData.delivery.address.city}
                </Text>
                <Text>
                  ul. {emailOrderData.delivery.address.street}{" "}
                  {emailOrderData.delivery.address.buildingNumber}
                  {emailOrderData.delivery.address.apartmentNumber
                    ? `/${emailOrderData.delivery.address.apartmentNumber}`
                    : ""}
                </Text>
              </Section>
            )}
            {emailOrderData.delivery.pickupPoint && (
              <Section>
                <Text className="mb-1 mt-0 font-bold">
                  Paczkomat {emailOrderData.delivery.pickupPoint.name}
                </Text>
                <Text>{emailOrderData.delivery.pickupPoint.address.city}</Text>
                <Text>
                  ul. {emailOrderData.delivery.pickupPoint.address.street}
                </Text>
              </Section>
            )}
          </Section>
          <Hr className="border m-0 border-primary/30" />
          <Section className="py-[20px] px-10">
            <Heading as="h2" className="mb-2 mt-0">
              Zamówione produkty
            </Heading>
            {emailOrderData.orderedItems.map((item) => (
              <Row key={item.id} className="mb-4 bg-card rounded-lg p-3">
                <Column className="w-[120px]">
                  <Img
                    src={item.offer.thumbnail}
                    alt={item.offer.name || "produkt"}
                    width={120}
                    height={120}
                    className="rounded-xl"
                  />
                </Column>
                <Column className="pl-4 align-middle">
                  <Text className="mt-0 mb-1 text-[18px] font-medium">
                    {item.offer.signature}
                  </Text>
                  <Text className="mt-0 mb-1 text-[18px]">
                    {Number(item.price.amount).toFixed(2)} {item.price.currency}
                  </Text>
                  <Text className="mt-0 mb-0 text-[14px] text-muted-foreground">
                    {item.offer.size && `r. ${item.offer.size}`}
                    &nbsp;&nbsp;&nbsp;&nbsp;ilość: {item.quantity}
                  </Text>
                </Column>
              </Row>
            ))}
            <Row>
              <Text className="text-lg mb-2">
                <span className="font-medium">Koszt dostawy: </span>
                {Number(emailOrderData.deliveryPrice.amount).toFixed(2)}{" "}
                {emailOrderData.deliveryPrice.currency}
              </Text>
              <Text className="text-lg mt-0">
                <span className="font-medium">Łączna kwota: </span>
                {Number(emailOrderData.totalToPay.amount).toFixed(2)}{" "}
                {emailOrderData.totalToPay.currency}
              </Text>
            </Row>
          </Section>
          <Hr className="border m-0 border-primary/30" />
          <Section className="py-[20px] px-10">
            <Heading as="h2" className="mb-2 mt-0">
              Dodatkowe informacje
            </Heading>
            <Text className="mb-1 mt-0 text-base">
              <span className="font-bold">Numer zamówienia: </span>#
              {emailOrderData.orderDetails.number}
            </Text>
            <Text className="mb-1 mt-0 text-base">
              <span className="font-bold">Data złożenia zamówienia: </span>
              {new Date(emailOrderData.orderDetails.createdAt).toLocaleString(
                "pl-PL",
                {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                }
              )}
            </Text>
            <Text className="mb-1 mt-0 text-base">
              <span className="font-bold">Przewidywany czas dostawy: </span>
              {new Date(
                emailOrderData.orderDetails.deliveryDate
              ).toLocaleDateString("pl-PL", {
                weekday: "long",
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              })}
            </Text>
            {emailOrderData.orderDetails.status === "UNPAID" && (
              <Text>
                Przewidywany czas dostawy zakłada otrzymanie płatności za
                zamówienie w momencie jego złożenia.
              </Text>
            )}
          </Section>
          <Hr className="border m-0 border-primary/30" />
          <Section className="py-[20px] px-10">
            <Heading as="h2" className="mb-0 mt-0">
              Masz jakieś pytania?
            </Heading>
            <Text className="mt-0 mb-2">
              Poniżej znajdziesz nasze dane kontaktowe. Chętnie pomożemy!
            </Text>
            <Text className="text-base font-medium">
              E-mail:{" "}
              <Link
                href="mailto:kontakt.kama.obuwie@gmail.com"
                className="text-text decoration-brand underline"
              >
                kontakt.kama.obuwie@gmail.com
              </Link>
            </Text>

            <Text className="text-base font-medium">
              Nr telefonu:{" "}
              <Link
                href="tel:+48664097737"
                className="text-text decoration-brand underline"
              >
                +48 664 097 737
              </Link>
            </Text>
            <Heading as="h4" className="m-0">
              Godziny pracy
            </Heading>
            <Text className="m-0">Pon - Pt: 8:00 - 16:30</Text>
            <Text className="m-0">Sobota: 8:00 - 13:30</Text>
          </Section>
          <Hr className="border m-0 border-primary/30" />

          <Section className="py-[20px] px-10">
            <Row>
              <Column align="left">
                <Text className="m-0 leading-tight">Pozdrawiamy</Text>
                <Text className="m-0 leading-tight">Zespół kama-obuwie</Text>
              </Column>
              <Column align="right">
                <Img
                  src={`${baseUrl}/branding/logo-banner.png`}
                  width="200"
                  alt="kama-obuwie"
                />
              </Column>
            </Row>
          </Section>
          <Hr className="border m-0 border-primary/30" />
          <Section className="py-[20px] px-10">
            <Link
              href={`${baseUrl}/info/contact`}
              className="text-text decoration-brand underline mr-4"
            >
              kontakt
            </Link>
            <Link
              href={`${baseUrl}/info/returns`}
              className="text-text decoration-brand underline mr-4"
            >
              zwroty
            </Link>
            <Link
              href={`${baseUrl}/info/complaints`}
              className="text-text decoration-brand underline mr-4"
            >
              reklamacje
            </Link>
            <Link
              href={`${baseUrl}/info/about`}
              className="text-text decoration-brand underline mr-4"
            >
              o nas
            </Link>
            <Link
              href={`${baseUrl}/info/regulations`}
              className="text-text decoration-brand underline mr-4"
            >
              regulamin
            </Link>
            <Link
              href={`${baseUrl}/info/privacy`}
              className="text-text decoration-brand underline"
            >
              polityka prywatności
            </Link>
          </Section>
        </Container>
      </Body>
    </Tailwind>
  </Html>
);

export default OrderCreated;
