// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FamilyTreeAuthenticationSection } from "./FamilyTreeAuthenticationSection";

describe("Google OAuth sign-in", () => {
  it("links the Google sign-in action to the Django OAuth endpoint", () => {
    render(<FamilyTreeAuthenticationSection />);

    const googleSignIn = screen.getByRole("link", {
      name: "Continue with Google",
    });

    expect(googleSignIn).toHaveAttribute(
      "href",
      "http://localhost:8000/accounts/google/login/",
    );
  });

  it("does not offer Apple sign-in", () => {
    render(<FamilyTreeAuthenticationSection />);

    expect(
      screen.queryByRole("link", { name: "Continue with Apple" }),
    ).not.toBeInTheDocument();
  });
});
