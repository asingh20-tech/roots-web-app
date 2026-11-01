import { useState } from "react";

type Provider = "Google" | "Apple" | null;

const familyNodes = [
  { label: "Family", className: "left-0" },
  { label: "Family", className: "left-[210px]" },
];

export const FamilyHistoryWelcomeAndSignInSection = (): JSX.Element => {
  const [selectedProvider, setSelectedProvider] = useState<Provider>(null);

  const handleProviderSignIn = (provider: Exclude<Provider, null>) => {
    setSelectedProvider(provider);
  };

  return (
    <main className="flex min-h-[764px] items-start relative self-stretch w-full">
      <section
        aria-labelledby="family-history-heading"
        className="flex flex-col w-[480px] items-start gap-8 pt-[58px] pb-12 px-12 relative self-stretch bg-[#ede8dc] border-r [border-right-style:solid] border-[#c8bfa8]"
      >
        <div className="flex flex-col items-start gap-5 relative self-stretch w-full flex-[0_0_auto]">
          <div className="relative w-fit mt-[-1.00px] [font-family:'Inter',Helvetica] font-semibold text-[#7a6e5c] text-[11px] tracking-[2.00px] leading-[normal] whitespace-nowrap">
            CONNECTED BY FAMILY
          </div>
          <h1
            id="family-history-heading"
            className="relative self-stretch [font-family:'Lora',Helvetica] font-normal text-[#2e3b2c] text-4xl tracking-[0] leading-[46.8px]"
          >
            Every story begins
            <br />
            with a root.
          </h1>
          <p className="relative self-stretch [font-family:'Inter',Helvetica] font-normal text-[#7a6e5c] text-[15px] tracking-[0] leading-[25.5px]">
            A place to trace your connections, bring generations together, and
            begin your family tree.
          </p>
        </div>
        <div
          aria-hidden="true"
          className="relative self-stretch w-full h-px bg-[#c8bfa8]"
        />
        <div className="flex flex-col items-center gap-[22px] relative self-stretch w-full flex-[0_0_auto]">
          <div
            className="relative w-[336px] h-[218px]"
            role="img"
            aria-label="A family tree showing you as the root connected to family members"
          >
            {familyNodes.map((node) => (
              <div
                key={`${node.className}-${node.label}`}
                className={`${node.className} flex flex-col w-[126px] h-[50px] items-center justify-center gap-1.5 absolute top-0 bg-[#faf8f4] rounded-lg overflow-hidden border border-solid border-[#c8bfa8]`}
              >
                <div className="relative w-fit [font-family:'Lora',Helvetica] font-normal text-[#2e3b2c] text-base tracking-[0] leading-[normal]">
                  {node.label}
                </div>
              </div>
            ))}

            <img
              className="absolute top-[46px] left-[62px] w-[212px] h-[91px]"
              src="/img/branches-1.svg"
              alt=""
              aria-hidden="true"
            />
            <div className="flex flex-col w-[126px] h-[78px] items-center justify-center gap-1.5 absolute top-[137px] left-[105px] bg-[#faf8f4] rounded-lg overflow-hidden border border-solid border-[#4a5e47]">
              <div className="[font-family:'Lora',Helvetica] font-normal text-[#2e3b2c] text-xl relative w-fit tracking-[0] leading-[normal]">
                You
              </div>
              <div className="relative w-fit [font-family:'Inter',Helvetica] font-normal text-[#7a6e5c] text-[10px] tracking-[1.50px] leading-[normal] whitespace-nowrap">
                THE ROOT
              </div>
            </div>
          </div>
          <p className="relative self-stretch [font-family:'Inter',Helvetica] font-normal text-[#7a6e5c] text-xs text-center tracking-[0.30px] leading-[normal]">
            One connection at a time.
          </p>
        </div>
      </section>
      <section
        aria-labelledby="sign-in-heading"
        className="flex flex-col items-center justify-center p-20 relative flex-1 self-stretch grow"
      >
        <div className="flex flex-col w-[440px] items-start gap-8 relative flex-[0_0_auto]">
          <div className="flex flex-col items-start gap-4 relative self-stretch w-full flex-[0_0_auto]">
            <p className="relative w-fit mt-[-1.00px] [font-family:'Inter',Helvetica] font-semibold text-[#4a5e47] text-[11px] tracking-[2.00px] leading-[normal] whitespace-nowrap">
              SIGN IN / SIGN UP
            </p>
            <h2
              id="sign-in-heading"
              className="[font-family:'Lora',Helvetica] text-[#2e3b2c] text-4xl leading-[45px] relative self-stretch font-normal tracking-[0]"
            >
              Welcome to Roots
            </h2>
            <p className="relative self-stretch [font-family:'Inter',Helvetica] font-normal text-[#7a6e5c] text-[15px] tracking-[0] leading-[25.5px]">
              Begin your family tree or pick up where you left off. Choose an
              option below to continue.
            </p>
          </div>
          <div className="flex flex-col items-start gap-3.5 relative self-stretch w-full flex-[0_0_auto]">
            <button
              type="button"
              onClick={() => handleProviderSignIn("Google")}
              aria-label="Continue with Google"
              className="flex h-[58px] items-center justify-center relative self-stretch w-full bg-[#4a5e47] rounded-md overflow-hidden border border-solid border-[#4a5e47] cursor-pointer"
            >
              <img
                className="absolute top-[18px] left-5 w-[22px] h-[22px]"
                src="/img/provider-logo-2.svg"
                alt=""
                aria-hidden="true"
              />
              <span className="relative w-fit [font-family:'Inter',Helvetica] font-medium text-[#faf8f4] text-[15px] tracking-[0.20px] leading-[normal] whitespace-nowrap">
                Continue with Google
              </span>
            </button>
            <button
              type="button"
              onClick={() => handleProviderSignIn("Apple")}
              aria-label="Continue with Apple"
              className="flex h-[58px] items-center justify-center relative self-stretch w-full bg-[#faf8f4] rounded-md overflow-hidden border border-solid border-[#c8bfa8] cursor-pointer"
            >
              <img
                className="absolute top-[18px] left-5 w-[22px] h-[22px]"
                src="/img/provider-logo-3.svg"
                alt=""
                aria-hidden="true"
              />
              <span className="relative w-fit [font-family:'Inter',Helvetica] font-medium text-[#2e3b2c] text-[15px] tracking-[0.20px] leading-[normal] whitespace-nowrap">
                Continue with Apple
              </span>
            </button>
          </div>
          <div className="flex flex-col items-start gap-5 relative self-stretch w-full flex-[0_0_auto]">
            <p className="relative self-stretch mt-[-1.00px] [font-family:'Inter',Helvetica] font-normal text-[#7a6e5c] text-[13px] tracking-[0] leading-[22.1px]">
              New here? These options create your account. Already have an
              account? Use the same provider to sign in.
            </p>
            <div className="flex items-center gap-[9px] relative self-stretch w-full flex-[0_0_auto]">
              <div className="relative w-[15px] h-[15px]" aria-hidden="true">
                <img
                  className="absolute w-[92.50%] h-[96.67%] top-[3.33%] left-[7.50%]"
                  src="/img/vector-7.svg"
                  alt=""
                />
              </div>
              <p className="relative w-fit mt-[-1.00px] [font-family:'Inter',Helvetica] font-normal text-[#4a5e47] text-xs tracking-[0] leading-[normal]">
                No separate Roots password to remember.
              </p>
            </div>
            <p className="sr-only" aria-live="polite">
              {selectedProvider ? `Continuing with ${selectedProvider}.` : ""}
            </p>
          </div>
          <div
            aria-hidden="true"
            className="relative self-stretch w-full h-px bg-[#c8bfa8]"
          />
          <p className="relative self-stretch [font-family:'Inter',Helvetica] font-normal text-[#7a6e5c] text-xs tracking-[0] leading-[21.6px]">
            <span>By continuing, you agree to our </span>
            <a href="/terms" className="text-[#4a5e47] underline">
              Terms of Service
            </a>
            <span> and acknowledge our </span>
            <a href="/privacy" className="text-[#4a5e47] underline">
              Privacy Policy
            </a>
            <span>.</span>
          </p>
        </div>
      </section>
    </main>
  );
};
