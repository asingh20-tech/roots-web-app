// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RootsFamilyTree } from "./RootsFamilyTree";

describe("RootsFamilyTree request modal", () => {
  it("opens the request modal from the toolbar and closes it with the X button", () => {
    render(<RootsFamilyTree />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Request a change" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Close request form" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
