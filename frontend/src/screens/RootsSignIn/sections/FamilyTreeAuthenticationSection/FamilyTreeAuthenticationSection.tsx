
const familyNodes = [
  {
    label: "Family",
    className:
      "left-[210px] flex flex-col w-[126px] h-[50px] items-center justify-center gap-1.5 absolute top-0",
  },
  {
    label: "Family",
    className:
      "left-0 flex flex-col w-[126px] h-[50px] items-center justify-center gap-1.5 absolute top-0",
  },
];

const authenticationProviders = [
  {
    name: "Continue with Google",
    href: "http://localhost:8000/accounts/google/login/",
    logo: "/img/provider-logo-2.svg",
    className: "bg-[#4a5e47] border-[#4a5e47] text-[#faf8f4]",
  },
];

export const FamilyTreeAuthenticationSection = (): JSX.Element => {
  return (
    <section className="flex min-h-[764px] items-start relative self-stretch w-full flex-[0_0_auto]">
      <aside className="flex flex-col w-[480px] min-h-[764px] items-start gap-8 pt-[58px] pb-12 px-12 relative self-stretch bg-[#ede8dc] border-r [border-right-style:solid] border-[#c8bfa8]">
        <header className="flex flex-col items-start gap-5 relative self-stretch w-full flex-[0_0_auto]">
          <div className="relative w-fit mt-[-1.00px] [font-family:'Inter',Helvetica] font-semibold text-[#7a6e5c] text-[11px] tracking-[2.00px] leading-[normal] whitespace-nowrap">
            CONNECTED BY FAMILY
          </div>
          <h1 className="relative self-stretch [font-family:'Lora',Helvetica] font-normal text-[#2e3b2c] text-4xl tracking-[0] leading-[46.8px]">
            Every story begins
            <br />
            with a root.
          </h1>
          <p className="relative self-stretch [font-family:'Inter',Helvetica] font-normal text-[#7a6e5c] text-[15px] tracking-[0] leading-[25.5px]">
            A place to trace your connections, bring generations together, and
            begin your family tree.
          </p>
        </header>
        <div
          aria-hidden="true"
          className="relative self-stretch w-full h-px bg-[#c8bfa8]"
        />
        <div className="flex flex-col items-center gap-[22px] relative self-stretch w-full flex-[0_0_auto]">
          <div
            className="relative w-[336px] h-[218px]"
            aria-label="Family tree illustration"
          >
            <div className="flex flex-col w-[126px] h-[78px] items-center justify-center gap-1.5 absolute top-[137px] left-[105px] bg-[#faf8f4] rounded-lg overflow-hidden border border-solid border-[#4a5e47]">
              <div className="[font-family:'Lora',Helvetica] text-[#2e3b2c] text-xl relative w-fit font-normal tracking-[0] leading-[normal]">
                You
              </div>
              <div className="relative w-fit [font-family:'Inter',Helvetica] font-normal text-[#7a6e5c] text-[10px] tracking-[1.50px] leading-[normal] whitespace-nowrap">
                THE ROOT
              </div>
            </div>
            {familyNodes.map((node) => (
              <div
                key={`${node.label}-${node.className}`}
                className={`${node.className} bg-[#faf8f4] rounded-lg overflow-hidden border border-solid border-[#c8bfa8]`}
              >
                <div className="[font-family:'Lora',Helvetica] font-normal text-[#2e3b2c] text-base tracking-[0] leading-[normal]">
                  {node.label}
                </div>
              </div>
            ))}

            <img
              className="absolute top-[46px] left-[62px] w-[212px] h-[91px]"
              alt=""
              src="/img/branches-1.svg"
            />
          </div>
          <p className="relative self-stretch [font-family:'Inter',Helvetica] font-normal text-[#7a6e5c] text-xs text-center tracking-[0.30px] leading-[normal]">
            One connection at a time.
          </p>
        </div>
      </aside>
      <main className="flex flex-col min-h-[764px] items-center justify-center p-20 relative flex-1 grow">
        <div className="w-[440px] gap-8 flex flex-col items-start relative flex-[0_0_auto]">
          <header className="flex flex-col items-start gap-4 relative self-stretch w-full flex-[0_0_auto]">
            <div className="relative w-fit mt-[-1.00px] [font-family:'Inter',Helvetica] font-semibold text-[#4a5e47] text-[11px] tracking-[2.00px] leading-[normal] whitespace-nowrap">
              SIGN IN / SIGN UP
            </div>
            <h2 className="relative self-stretch [font-family:'Lora',Helvetica] font-normal text-[#2e3b2c] text-4xl tracking-[0] leading-[45px]">
              Welcome to Roots
            </h2>
            <p className="relative self-stretch [font-family:'Inter',Helvetica] font-normal text-[#7a6e5c] text-[15px] tracking-[0] leading-[25.5px]">
              Begin your family tree or pick up where you left off. Choose an
              option below to continue.
            </p>
          </header>
          <nav
            aria-label="Authentication providers"
            className="flex flex-col items-start gap-3.5 relative self-stretch w-full flex-[0_0_auto]"
          >
            {authenticationProviders.map((provider) => (
              <a
                key={provider.name}
                className={`flex h-[58px] items-center justify-center relative self-stretch w-full rounded-md overflow-hidden border border-solid ${provider.className}`}
                href={provider.href}
                aria-label={provider.name}
              >
                <img
                  className="absolute top-[18px] left-5 w-[22px] h-[22px]"
                  alt=""
                  src={provider.logo}
                />
                <span className="[font-family:'Inter',Helvetica] font-medium text-[15px] tracking-[0.20px] leading-[normal] whitespace-nowrap">
                  {provider.name}
                </span>
              </a>
            ))}
          </nav>
          <div className="gap-5 self-stretch w-full flex flex-col items-start relative flex-[0_0_auto]">
            <p className="relative self-stretch mt-[-1.00px] [font-family:'Inter',Helvetica] font-normal text-[#7a6e5c] text-[13px] tracking-[0] leading-[22.1px]">
              New here? These options create your account. Already have an
              account? Use the same provider to sign in.
            </p>
            <div className="flex items-center gap-[9px] relative self-stretch w-full flex-[0_0_auto]">
              <div className="relative w-[15px] h-[15px]" aria-hidden="true">
                <img
                  className="absolute w-[92.50%] h-[96.67%] top-[3.33%] left-[7.50%]"
                  alt=""
                  src="/img/vector-7.svg"
                />
              </div>
              <p className="relative w-fit mt-[-1.00px] [font-family:'Inter',Helvetica] font-normal text-[#4a5e47] text-xs tracking-[0] leading-[normal]">
                No separate Roots password to remember.
              </p>
            </div>
          </div>
          <div
            aria-hidden="true"
            className="relative self-stretch w-full h-px bg-[#c8bfa8]"
          />
        </div>
      </main>
    </section>
  );
};
