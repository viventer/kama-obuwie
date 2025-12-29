import { Heading, Img, Section, Text } from "@react-email/components";

export default function EmailHeader({
  headingText,
  descriptionText,
  baseUrl,
}: {
  headingText: string;
  descriptionText?: string;
  baseUrl: string;
}) {
  return (
    <Section className="py-10 px-[74px] text-center">
      <Img
        src={`${baseUrl}/branding/logo-banner.png`}
        width="300"
        alt="kama-obuwie"
        className="mx-auto"
      />
      <Heading className="text-[32px] mb-2">{headingText}</Heading>
      {descriptionText && (
        <Text className="m-0 text-[14px] font-medium">{descriptionText}</Text>
      )}
    </Section>
  );
}
