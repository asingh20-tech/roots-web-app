const footerLinks = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Help", href: "/help" },
];

export const FooterSection = (): JSX.Element => {
  return (
    <footer className="absolute top-[984px] left-0 flex h-10 w-[1440px] items-center justify-between border-t [border-top-style:solid] [border-right-style:none] [border-bottom-style:none] [border-left-style:none] border-[#c8bfa8] bg-[#ede8dc] px-12 py-0">
      <p className="relative w-fit whitespace-nowrap [font-family:'Inter',Helvetica] text-[11px] font-normal tracking-[1.00px] leading-[normal] text-[#b0a48e]">
        © 2026 Roots · Family History Platform
      </p>
      <nav
        aria-label="Footer navigation"
        className="relative inline-flex flex-[0_0_auto] items-start gap-6"
      >
        {footerLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="relative mt-[-1.00px] w-fit whitespace-nowrap [font-family:'Inter',Helvetica] text-[11px] font-normal tracking-[0] leading-[normal] text-[#7a6e5c]"
          >
            {link.label}
          </a>
        ))}
      </nav>
    </footer>
  );
};
