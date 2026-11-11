import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthProvider";

type AppHeaderProps = {
  // Highlights "My Trees" on the dashboard and inside a tree.
  current?: "my-trees";
};

const navLinkClass =
  "inline-flex flex-col items-start justify-center relative self-stretch flex-[0_0_auto] border-b-[3px] [border-bottom-style:solid]";

// App header for signed-in screens (My Trees, tree workspace, invitations).
export const AppHeader = ({ current }: AppHeaderProps): JSX.Element => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const initials =
    `${user?.first_name?.charAt(0) ?? ""}${user?.last_name?.charAt(0) ?? ""}`.toUpperCase() ||
    user?.email?.charAt(0).toUpperCase() ||
    "?";

  const handleSignOut = async () => {
    setIsAccountMenuOpen(false);
    // Leave the protected page first: once the session is cleared the route
    // guard would unmount this header and send the user to /sign-in instead.
    navigate("/", { replace: true });
    await signOut();
  };
  const accountMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent): void => {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(event.target as Node)
      ) {
        setIsAccountMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        setIsAccountMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleDocumentClick);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <header className="flex h-[76px] items-center gap-5 px-4 py-0 relative self-stretch w-full bg-white border-b [border-bottom-style:solid] border-[#dedcd2] sm:px-9 lg:gap-[60px]">
      <Link
        className="inline-flex items-center gap-[9px] relative flex-[0_0_auto]"
        to="/"
        aria-label="Roots home"
      >
        <img
          className="relative w-[46px] h-[37px] sm:w-[57px] sm:h-[46px]"
          alt="Tree logo"
          src="/img/tree-logo-2.png"
        />
        <span className="relative hidden w-fit [font-family:'Lora',Helvetica] font-normal text-[#355b43] text-[32px] tracking-[-0.32px] leading-[normal] sm:inline">
          Roots
        </span>
      </Link>
      <nav
        className="flex items-center gap-6 relative flex-1 self-stretch grow sm:gap-8"
        aria-label="Primary navigation"
      >
        <Link className={`${navLinkClass} border-transparent`} to="/">
          <span className="relative w-fit [font-family:'Inter',Helvetica] font-semibold text-[#7b8177] text-sm leading-[normal] hover:text-[#355b43]">
            Home
          </span>
        </Link>
        <Link
          className={`${navLinkClass} ${current === "my-trees" ? "border-[#355b43]" : "border-transparent"}`}
          to="/my-trees"
          aria-current={current === "my-trees" ? "page" : undefined}
        >
          <span
            className={`relative w-fit [font-family:'Inter',Helvetica] font-semibold text-sm leading-[normal] ${
              current === "my-trees" ? "text-[#355b43]" : "text-[#7b8177] hover:text-[#355b43]"
            }`}
          >
            My Trees
          </span>
        </Link>
      </nav>
      <div
        className="inline-flex items-center gap-[22px] relative flex-[0_0_auto]"
        ref={accountMenuRef}
      >
        <div className="inline-flex items-center gap-2.5 relative flex-[0_0_auto]">
          <button
            className="inline-flex items-center gap-2.5 relative flex-[0_0_auto] cursor-pointer"
            type="button"
            aria-label={`My Account${user?.email ? ` (${user.email})` : ""}`}
            aria-haspopup="menu"
            aria-expanded={isAccountMenuOpen}
            aria-controls="account-menu"
            onClick={() => setIsAccountMenuOpen((isOpen) => !isOpen)}
          >
            <span
              className="flex w-[34px] h-[34px] items-center justify-center relative bg-[#e8ede3] rounded-[100px] overflow-hidden"
              aria-hidden="true"
            >
              <span className="relative w-fit [font-family:'Inter',Helvetica] font-semibold text-[#355b43] text-xs tracking-[0] leading-[normal]">
                {initials}
              </span>
            </span>
            <span className="relative hidden w-fit [font-family:'Inter',Helvetica] font-normal text-[#283b30] text-[13px] tracking-[0] leading-[normal] sm:inline">
              My Account
            </span>
            <span className="relative w-3.5 h-3.5" aria-hidden="true">
              <img
                className="absolute w-[80.71%] h-[68.21%] top-[31.79%] left-[19.29%]"
                alt=""
                src="/img/vector-36.svg"
              />
            </span>
          </button>
          {isAccountMenuOpen && (
            <div
              id="account-menu"
              className="absolute right-0 top-[50px] z-10 min-w-[150px] rounded-md border border-[#dedcd2] bg-white py-1 shadow-md"
              role="menu"
            >
              <button
                className="block w-full cursor-pointer px-4 py-2 text-left [font-family:'Inter',Helvetica] text-[13px] text-[#283b30] hover:bg-[#f5f6f2]"
                type="button"
                role="menuitem"
                onClick={() => void handleSignOut()}
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
