import Script from "next/script";

export const TRUSTMATE_INVITATION_COMPANY_UUID =
  "73701a69-f534-4964-a410-06986fc96239";

const TRUSTMATE_INVITATION_SCRIPT_URL =
  "https://trustmate.pro/web/api/invitation/script";

type TrustmateReviewInvitationProps = {
  userName: string;
  userEmail: string;
  orderNumber: string;
};

export default function TrustmateReviewInvitation({
  userName,
  userEmail,
  orderNumber,
}: TrustmateReviewInvitationProps) {
  if (process.env.NEXT_PUBLIC_NODE_ENV !== "production") {
    return null;
  }

  return (
    <>
      <Script id="trustmate-invitation-config" strategy="afterInteractive">
        {`
TRUST_MATE_USER_NAME = ${JSON.stringify(userName)};
TRUST_MATE_USER_EMAIL = ${JSON.stringify(userEmail)};
TRUST_MATE_ORDER_NUMBER = ${JSON.stringify(orderNumber)};
TRUST_MATE_COMPANY_UUID = ${JSON.stringify(TRUSTMATE_INVITATION_COMPANY_UUID)};
        `.trim()}
      </Script>
      <Script
        id="trustmate-invitation-loader"
        src={TRUSTMATE_INVITATION_SCRIPT_URL}
        strategy="afterInteractive"
      />
    </>
  );
}
