import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const googleSegments = [
  {
    src: "/img/google-red-segment.svg",
    alt: "Google red segment",
    className: "absolute top-0 left-px w-[19px] h-2.5",
  },
  {
    src: "/img/google-yellow-segment.svg",
    alt: "Google yellow segment",
    className: "absolute top-[7px] left-0 w-[5px] h-[11px]",
  },
  {
    src: "/img/google-green-segment.svg",
    alt: "Google green segment",
    className: "absolute top-3.5 left-[3px] w-[17px] h-2.5",
  },
  {
    src: "/img/google-blue-segment.svg",
    alt: "Google blue segment",
    className: "absolute top-2.5 left-3 w-3 h-3",
  },
];

export const GoogleAccountSelectionSection = (): JSX.Element => {
  const navigate = useNavigate();
  const [isAccountSelected, setIsAccountSelected] = useState(true);

  const handleCancel = (): void => {
    navigate(-1);
  };

  const handleUseAnotherAccount = (): void => {
    setIsAccountSelected(false);
  };

  return (
    <section
      aria-labelledby="google-account-title"
      className="flex flex-col w-[560px] items-start absolute top-[223px] left-[440px] bg-white rounded-[28px] overflow-hidden shadow-[0px_20px_64px_#00000033]"
    >
      <header className="flex h-[68px] items-center gap-3 px-7 py-0 relative self-stretch w-full border-b [border-bottom-style:solid] border-[#dadce0]">
        <div aria-hidden="true" className="relative w-6 h-6">
          {googleSegments.map((segment) => (
            <img
              key={segment.src}
              className={segment.className}
              alt={segment.alt}
              src={segment.src}
            />
          ))}
        </div>
        <div className="relative flex-1 [font-family:'Roboto',Helvetica] font-medium text-[#444746] text-[15px] tracking-[0] leading-[normal]">
          Sign in with Google
        </div>
        <button
          type="button"
          aria-label="Close sign-in dialog"
          onClick={handleCancel}
          className="flex w-8 h-8 items-center justify-center relative"
        >
          <span className="relative w-5 h-5">
            <img
              className="absolute w-[79.50%] h-[79.50%] top-[20.50%] left-[20.50%]"
              alt=""
              aria-hidden="true"
              src="/img/vector.svg"
            />
          </span>
        </button>
      </header>
      <div className="flex flex-col items-start gap-6 p-9 relative self-stretch w-full flex-[0_0_auto]">
        <div className="flex flex-col items-start gap-2.5 relative self-stretch w-full flex-[0_0_auto]">
          <h1
            id="google-account-title"
            className="mt-[-1.00px] [font-family:'Roboto',Helvetica] text-[#1f1f1f] text-[32px] leading-[38.4px] relative self-stretch font-normal tracking-[0]"
          >
            Choose an account
          </h1>
          <p className="relative self-stretch [font-family:'Roboto',Helvetica] font-normal text-transparent text-[17px] tracking-[0] leading-[23.8px]">
            <span className="text-[#444746]">Continue to </span>
            <span className="font-medium text-[#0b57d0]">Roots</span>
          </p>
        </div>
        <div className="flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]">
          <button
            type="button"
            aria-pressed={isAccountSelected}
            onClick={() => setIsAccountSelected(true)}
            className={`flex min-h-[88px] items-center gap-3.5 p-4 relative self-stretch w-full flex-[0_0_auto] rounded-xl overflow-hidden border border-solid ${
              isAccountSelected
                ? "bg-[#e8f0fe] border-[#0b57d0]"
                : "bg-white border-[#dadce0]"
            }`}
          >
            <span className="flex w-10 h-10 items-center justify-center relative bg-[#0b57d0] rounded-[100px] overflow-hidden">
              <span className="relative w-fit [font-family:'Roboto',Helvetica] font-normal text-white text-xl tracking-[0] leading-[normal] whitespace-nowrap">
                D
              </span>
            </span>
            <span className="flex flex-col items-start gap-[5px] relative flex-1 grow text-left">
              <span className="relative w-fit mt-[-1.00px] [font-family:'Roboto',Helvetica] font-medium text-[#1f1f1f] text-base tracking-[0] leading-[normal] whitespace-nowrap">
                Demo account
              </span>
              <span className="relative w-fit [font-family:'Roboto',Helvetica] font-normal text-[#444746] text-sm tracking-[0] leading-[normal] whitespace-nowrap">
                demo@example.com
              </span>
            </span>
            <span className="relative w-5 h-5">
              <img
                className="absolute w-[96.17%] h-[96.17%] top-[3.83%] left-[3.83%]"
                alt=""
                aria-hidden="true"
                src="/img/vector-1.svg"
              />
            </span>
          </button>
          <button
            type="button"
            onClick={handleUseAnotherAccount}
            className="flex h-[60px] items-center gap-[18px] px-5 py-0 relative self-stretch w-full border-b [border-bottom-style:solid] border-[#dadce0] text-left"
          >
            <span className="relative w-6 h-6">
              <img
                className="absolute w-[86.66%] h-[90.83%] top-[9.17%] left-[13.34%]"
                alt=""
                aria-hidden="true"
                src="/img/vector-2.svg"
              />
            </span>
            <span className="[font-family:'Roboto',Helvetica] font-medium text-[#0b57d0] text-sm whitespace-nowrap relative w-fit tracking-[0] leading-[normal]">
              Use another account
            </span>
          </button>
        </div>
        <p className="relative self-stretch [font-family:'Roboto',Helvetica] font-normal text-transparent text-sm tracking-[0] leading-[21px]">
          <span className="text-[#444746]">
            To continue, Google will share your name, email address, and profile
            picture with Roots. Review Roots&apos;{" "}
          </span>
          <a className="text-[#0b57d0]" href="/privacy-policy">
            Privacy Policy
          </a>
          <span className="text-[#444746]"> and </span>
          <a className="text-[#0b57d0]" href="/terms-of-service">
            Terms of Service
          </a>
          <span className="text-[#444746]">.</span>
        </p>
        <div className="flex items-center justify-between relative self-stretch w-full flex-[0_0_auto]">
          <button
            type="button"
            onClick={handleCancel}
            className="relative w-fit [font-family:'Roboto',Helvetica] font-medium text-[#0b57d0] text-sm tracking-[0] leading-[normal] whitespace-nowrap"
          >
            Cancel
          </button>
          <Link
            aria-disabled={!isAccountSelected}
            className={`inline-flex h-10 items-center justify-center px-6 py-0 relative flex-[0_0_auto] rounded-[100px] overflow-hidden ${
              isAccountSelected
                ? "bg-[#0b57d0]"
                : "bg-[#9aa0a6] pointer-events-none"
            }`}
            to={isAccountSelected ? "/wireframe-u45-1" : "#"}
            onClick={(event) => {
              if (!isAccountSelected) {
                event.preventDefault();
              }
            }}
          >
            <span className="[font-family:'Roboto',Helvetica] font-medium text-white text-sm whitespace-nowrap relative w-fit tracking-[0] leading-[normal]">
              Continue
            </span>
          </Link>
        </div>
        <aside
          role="note"
          className="flex items-center gap-2 p-3 relative self-stretch w-full flex-[0_0_auto] bg-[#f0f4f9] rounded-lg overflow-hidden"
        >
          <span className="relative w-4 h-4">
            <img
              className="absolute w-[96.36%] h-[96.36%] top-[3.64%] left-[3.64%]"
              alt=""
              aria-hidden="true"
              src="/img/vector-3.svg"
            />
          </span>
          <p className="relative flex-1 mt-[-1.00px] [font-family:'Roboto',Helvetica] font-normal text-[#444746] text-xs tracking-[0] leading-[16.8px]">
            Demo only. No account is signed in or connected.
          </p>
        </aside>
      </div>
    </section>
  );
};
