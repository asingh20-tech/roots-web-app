
import { AppHeaderSection } from "./sections/AppHeaderSection";

export const RootsBennettFamily = (): JSX.Element => {
  return (
    <main className="flex min-h-screen flex-col items-stretch bg-[#f6f4ee] text-[#272522]">
      <AppHeaderSection />

      <section
        id="family-tree"
        aria-label="Empty family tree"
        className="relative flex-1 bg-[#f6f4ee]"
      >
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(#c9c8bf 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
      </section>
    </main>
  );
};
