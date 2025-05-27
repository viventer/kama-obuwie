import SubpageHeading from "../SubpageHeading";

export default function FormWrapper({
  children,
  headingText,
}: {
  children: React.ReactNode;
  headingText: string;
}) {
  return (
    <div className="w-full max-w-4xl mx-auto sm:bg-primary/5 sm:py-12 sm:px-16 rounded-sm shadow-md bg-transparent">
      <SubpageHeading text={headingText} />
      {children}
    </div>
  );
}
