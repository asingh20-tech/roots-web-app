// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "../../../../services/api";
import { ChangeRequestModalSection } from "./ChangeRequestModalSection";

const members = [
  { id: 1, fullName: "Clara Bennett" },
  { id: 2, fullName: "James Bennett" },
];

const noopSubmit = async () => undefined;

afterEach(() => cleanup());

describe("ChangeRequestModalSection", () => {
  it("shows member fields by default and updates the review", () => {
    render(<ChangeRequestModalSection onClose={() => undefined} onSubmit={noopSubmit} />);

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
      <ChangeRequestModalSection
        members={members}
        onClose={() => undefined}
        onSubmit={noopSubmit}
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
    render(<ChangeRequestModalSection onClose={() => undefined} onSubmit={noopSubmit} />);

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
      <ChangeRequestModalSection
        members={members}
        onClose={() => undefined}
        onSubmit={noopSubmit}
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
      <ChangeRequestModalSection
        members={members}
        onClose={() => undefined}
        onSubmit={noopSubmit}
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
    render(<ChangeRequestModalSection onClose={onClose} onSubmit={noopSubmit} />);

    fireEvent.click(screen.getByRole("button", { name: "Close request form" }));
    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("sends an ADD_MEMBER request with optional dates left out", async () => {
    const onSubmit = vi.fn(async () => undefined);
    render(<ChangeRequestModalSection onClose={() => undefined} onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText("First name"), { target: { value: " Clara " } });
    fireEvent.change(screen.getByLabelText("Last name"), { target: { value: "Bennett" } });
    fireEvent.change(screen.getByLabelText("Gender"), { target: { value: "FEMALE" } });
    fireEvent.change(screen.getByLabelText("Notes for the Tree Owner"), {
      target: { value: "My grandmother." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Submit request" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith({
      change_type: "ADD_MEMBER",
      description: "My grandmother.",
      proposed_data: { first_name: "Clara", last_name: "Bennett", gender: "FEMALE" },
    });
    expect(await screen.findByRole("status")).toHaveTextContent("Request sent.");
    expect(screen.getByLabelText("First name")).toHaveValue("");
  });

  it("sends an ADD_RELATIONSHIP request with numeric member ids", async () => {
    const onSubmit = vi.fn(async () => undefined);
    render(
      <ChangeRequestModalSection members={members} onClose={() => undefined} onSubmit={onSubmit} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Add relationship" }));
    fireEvent.change(screen.getByLabelText("First member"), { target: { value: "1" } });
    fireEvent.change(screen.getByLabelText("Relationship"), { target: { value: "SPOUSE" } });
    fireEvent.change(screen.getByLabelText("Second member"), { target: { value: "2" } });
    fireEvent.change(screen.getByLabelText("Marriage date (optional)"), {
      target: { value: "1960-06-11" },
    });
    fireEvent.change(screen.getByLabelText("Notes for the Tree Owner"), {
      target: { value: "Married in York." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Submit request" }));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        change_type: "ADD_RELATIONSHIP",
        description: "Married in York.",
        proposed_data: {
          member1: 1,
          member2: 2,
          relationship_type: "SPOUSE",
          start_date: "1960-06-11",
        },
      }),
    );
  });

  it("shows the backend's validation message and keeps the form", async () => {
    const onSubmit = vi.fn(async () => {
      throw new ApiError(400, "Bad Request", {
        proposed_data: { death_date: ["Death date cannot be before the birth date."] },
      });
    });
    render(<ChangeRequestModalSection onClose={() => undefined} onSubmit={onSubmit} />);
    fireEvent.change(screen.getByLabelText("First name"), { target: { value: "Clara" } });
    fireEvent.change(screen.getByLabelText("Last name"), { target: { value: "Bennett" } });
    fireEvent.change(screen.getByLabelText("Notes for the Tree Owner"), {
      target: { value: "Notes" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Submit request" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Death date cannot be before the birth date.",
    );
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.getByLabelText("First name")).toHaveValue("Clara");
  });
});
