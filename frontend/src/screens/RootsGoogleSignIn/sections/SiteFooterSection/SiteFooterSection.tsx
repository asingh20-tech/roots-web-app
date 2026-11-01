const footerLinks = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Help", href: "/help" },
];

export const SiteFooterSection = (): JSX.Element => {
  return (
    <footer className="flex h-10 items-center justify-between px-12 py-0 relative self-stretch w-full bg-[#ede8dc] border-t [border-top-style:solid] [border-right-style:none] [border-bottom-style:none] [border-left-style:none] border-[#c8bfa8]">
      <p className="relative w-fit [font-family:'Inter',Helvetica] font-normal text-[#7a6e5c] text-[11px] tracking-[1.00px] leading-[normal] whitespace-nowrap">
        © 2026 Roots · Family History Platform
      </p>
      <nav aria-label="Footer navigation">
        <div className="inline-flex items-start gap-6 relative flex-[0_0_auto]">
          {footerLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="relative w-fit mt-[-1.00px] [font-family:'Inter',Helvetica] font-normal text-[#7a6e5c] text-[11px] tracking-[0] leading-[normal] whitespace-nowrap focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7a6e5c]"
            >
              {link.label}
            </a>
          ))}
        </div>
      </nav>
    </footer>
  );
};
