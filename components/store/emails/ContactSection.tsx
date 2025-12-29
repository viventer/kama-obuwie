import { Heading, Link, Section, Text } from "@react-email/components";

export default function ContactSection() {
  return (
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
  );
}
