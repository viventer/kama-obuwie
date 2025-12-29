import {
  Column,
  Hr,
  Img,
  Link,
  Row,
  Section,
  Text,
} from "@react-email/components";

export default function EmailFooter({ baseUrl }: { baseUrl: string }) {
  return (
    <>
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
    </>
  );
}
