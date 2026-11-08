// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AddPersonRequestModalSection } from "./AddPersonRequestModalSection";

const members = [
  { id: 1, fullName: "Clara Bennett" },
  { id: 2, fullName: "James Bennett" },
];

afterEach(() => cleanup());

describe("AddPersonRequestModalSection", () => {
  it("shows member fields by default and updates the review", () => {
    render(<AddPersonRequestModalSection onClose={() => undefined} />);

    const firstName = screen.getByLabelText("First name");
    const lastName = screen.getByLabelText("Last name");
    const birthDate = screen.getByLabelText("Birth date (optional)");
    const deathDate = screen.getByLabelText("Death date (optional)");

    expect(firstName).toBeRequired();
    expect(lastName).toBeRequired();
    expect(firstName).toHaveAttribute("maxlength", "50");
    expect(screen.getByLabelText("Gender")).toHaveValue("UNKNOWN");

    fireEvent.change(firstName, { target: { value: "Clara" } });
    fireEvent.change(lastName, { target: { value: "Bennett" } });
    fireEvent.change(birthDate, { target: { value: "1965-04-22" } });

    expect(screen.getByText("Name: Clara Bennett")).toBeInTheDocument();
    expect(deathDate).toHaveAttribute("min", "1965-04-22");
  });

  it("switches between member and relationship request forms", () => {
    render(
      <AddPersonRequestModalSection
        members={members}
        onClose={() => undefined}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Add relationship" }));

    expect(screen.getByLabelText("First member")).toBeInTheDocument();
    expect(screen.getByLabelText("Relationship")).toBeInTheDocument();
    expect(screen.getByLabelText("Second member")).toBeInTheDocument();
    expect(screen.queryByLabelText("First name")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Add member" }));

    expect(screen.getByLabelText("First name")).toBeInTheDocument();
    expect(screen.queryByLabelText("First member")).not.toBeInTheDocument();
  });

  it("disables relationship submission until two saved members exist", () => {
    render(<AddPersonRequestModalSection onClose={() => undefined} />);

    fireEvent.click(screen.getByRole("button", { name: "Add relationship" }));

    expect(
      screen.getByText(
        "At least two saved family members are required before a relationship can be requested.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Submit request" })).toBeDisabled();
  });

  it("shows a marriage date only for spouse relationships", () => {
    render(
      <AddPersonRequestModalSection
        members={members}
        onClose={() => undefined}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Add relationship" }));

    const relationshipType = screen.getByLabelText("Relationship");
    expect(screen.queryByLabelText("Marriage date (optional)")).not.toBeInTheDocument();

    fireEvent.change(relationshipType, { target: { value: "SPOUSE" } });
    expect(screen.getByLabelText("Marriage date (optional)")).toBeInTheDocument();

    fireEvent.change(relationshipType, { target: { value: "SIBLING" } });
    expect(screen.queryByLabelText("Marriage date (optional)")).not.toBeInTheDocument();
  });

  it("rejects a relationship between the same member", () => {
    render(
      <AddPersonRequestModalSection
        members={members}
        onClose={() => undefined}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Add relationship" }));

    fireEvent.change(screen.getByLabelText("First member"), {
      target: { value: "1" },
    });
    fireEvent.change(screen.getByLabelText("Second member"), {
      target: { value: "1" },
    });
    fireEvent.change(screen.getByLabelText("Notes for the Tree Owner"), {
      target: { value: "These records appear to describe the same person." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Submit request" }));

    expect(
      screen.getByText("A member cannot have a relationship with themselves."),
    ).toBeInTheDocument();
  });

  it("calls onClose from both close controls", () => {
    const onClose = vi.fn();
    render(<AddPersonRequestModalSection onClose={onClose} />);

    fireEvent.click(screen.getByRole("button", { name: "Close request form" }));
    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
