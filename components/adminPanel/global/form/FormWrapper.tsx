import SubpageHeading from "../SubpageHeading";

export default function FormWrapper({
  children,
  headingText,
}: {
  children: React.ReactNode;
  headingText: string;
}) {
  return (
    <div className="w-full max-w-4xl mx-auto bg-primary/5 py-12 px-16 rounded-sm shadow-md">
      <SubpageHeading text={headingText} />
      {children}
    </div>
  );
}
