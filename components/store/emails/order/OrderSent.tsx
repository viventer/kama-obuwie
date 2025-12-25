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
import EmailHeader from "../EmailHeader";
import OrderStatusAndPayment from "./OrderStatusAndPayment";
import OrderAddressData from "./OrderAddressData";
import OrderedItemsList from "./OrderedItemsList";
import OrderAdditionalInfo from "./OrderAdditionalInfo";
import ContactSection from "../ContactSection";
import EmailFooter from "../EmailFooter";

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

const OrderSent = ({ emailOrderData }: { emailOrderData: EmailOrderData }) => (
  <Html>
    <Head />
    <Tailwind config={emailTailwindConfig}>
      <Body className="font-[ubuntu,roboto,arial,sans-serif] text-text text-base">
        <Preview>Twoje zamówienie jest już w drodze</Preview>
        <Container className="my-[10px] mx-auto w-[600px] max-w-full border-2 border-primary rounded-lg">
          <EmailHeader
            baseUrl={baseUrl}
            headingText="Zamówienie wysłane!"
            descriptionText={`Paczka z Twoim zamówieniem jest już w drodze. Poniżej znajdziesz szczegóły dotyczące dostawy oraz zamówionych produktów.`}
          />
          <Hr className="border m-0 border-primary/30" />
          <OrderStatusAndPayment
            emailOrderData={emailOrderData}
            baseUrl={baseUrl}
          />
          <Hr className="border m-0 border-primary/30" />
          <OrderAddressData emailOrderData={emailOrderData} />
          <Hr className="border m-0 border-primary/30" />
          <OrderedItemsList emailOrderData={emailOrderData} />
          <Hr className="border m-0 border-primary/30" />
          <OrderAdditionalInfo emailOrderData={emailOrderData} />
          <Hr className="border m-0 border-primary/30" />
          <ContactSection />
          <Hr className="border m-0 border-primary/30" />
          <EmailFooter baseUrl={baseUrl} />
        </Container>
      </Body>
    </Tailwind>
  </Html>
);

export default OrderSent;
