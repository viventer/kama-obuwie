export default function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`text-[#787878] ${className || ''}`}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.02421 14C6.02421 13.1108 6.17189 12.2584 6.43546 11.4588L1.82199 7.93579C0.922845 9.76139 0.41626 11.8185 0.41626 14C0.41626 16.1796 0.922222 18.2354 1.82012 20.0598L6.4311 16.5299C6.17002 15.7341 6.02421 14.8848 6.02421 14Z"
        className="fill-current opacity-70"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14.1246 5.9111C16.0562 5.9111 17.8009 6.59554 19.1717 7.71554L23.1596 3.73332C20.7295 1.61776 17.614 0.311096 14.1246 0.311096C8.70728 0.311096 4.05143 3.40914 1.82196 7.93581L6.43544 11.4588C7.49846 8.23199 10.5286 5.9111 14.1246 5.9111Z"
        className="fill-current opacity-40"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14.1246 22.0889C10.5286 22.0889 7.49846 19.768 6.43544 16.5411L1.82196 20.0635C4.05143 24.5908 8.70728 27.6889 14.1246 27.6889C17.4682 27.6889 20.6603 26.5017 23.0562 24.2772L18.677 20.8917C17.4414 21.6701 15.8855 22.0889 14.1246 22.0889Z"
        className="fill-current opacity-47"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M27.2098 14C27.2098 13.1911 27.0852 12.32 26.8982 11.5111H14.1246V16.8H21.4772C21.1096 18.6032 20.1089 19.9895 18.677 20.8917L23.0562 24.2772C25.5729 21.9414 27.2098 18.462 27.2098 14Z"
        className="fill-current opacity-48"
      />
    </svg>
  );
}
