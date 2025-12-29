import { EmailOrderData } from "@/firebase/schemas/ordersSchemas";
import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import EmailHeader from "../EmailHeader";
import ContactSection from "../ContactSection";
import OrderedItemsList from "./OrderedItemsList";
import OrderAdditionalInfo from "./OrderAdditionalInfo";
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

const OrderCancelled = ({
  emailOrderData,
}: {
  emailOrderData: EmailOrderData;
}) => (
  <Html>
    <Head />
    <Tailwind config={emailTailwindConfig}>
      <Body className="font-[ubuntu,roboto,arial,sans-serif] text-text text-base">
        <Preview>Twoje zamówienie zostało anulowane</Preview>
        <Container className="my-[10px] mx-auto w-[600px] max-w-full border-2 border-primary rounded-lg">
          <EmailHeader baseUrl={baseUrl} headingText="Zamówienie anulowane" />
          <Hr className="border m-0 border-primary/30" />
          <Section className="py-[20px] px-10">
            <Text className="m-0 text-[14px] font-medium mb-2">
              Niestety musieliśmy anulować Twoje zamówienie{" "}
              <span className="font-bold">
                #{emailOrderData.orderDetails.number}
              </span>{" "}
              z powodu brakujących produktów w magazynie. Przepraszamy za
              wszelkie niedogodności.
            </Text>
            {emailOrderData.paymentType !== "COD" &&
            emailOrderData.orderDetails.status === "NEW" ? (
              <Text className="m-0 text-[14px] font-medium mb-2">
                Wpłata za zamówienie
                <span className="font-bold">
                  {" "}
                  zostanie automatycznie zwrócona
                </span>{" "}
                na Twoje konto w ciągu kilku dni roboczych.
              </Text>
            ) : null}
          </Section>
          <Hr className="border m-0 border-primary/30" />
          <ContactSection />
          <Hr className="border m-0 border-primary/30" />
          <OrderedItemsList emailOrderData={emailOrderData} />
          <Hr className="border m-0 border-primary/30" />
          <OrderAdditionalInfo emailOrderData={emailOrderData} />
          <Hr className="border m-0 border-primary/30" />
          <EmailFooter baseUrl={baseUrl} />
        </Container>
      </Body>
    </Tailwind>
  </Html>
);

export default OrderCancelled;
