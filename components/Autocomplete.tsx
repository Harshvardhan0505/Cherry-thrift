"use client";

import { useEffect, useId, useRef, useState } from "react";

// A text field that suggests matching options as you type, like the state
// and city boxes on big Indian shopping sites. Arrow keys move through the
// list, Enter picks, Escape closes.
export function Autocomplete({
  name,
  value,
  onChange,
  options,
  hint,
  inputClass,
  autoComplete,
  required,
  invalidMessage,
  validate,
}: {
  name: string;
  value: string;
  onChange: (value: string) => void;
  // Suggestions for what has been typed so far.
  options: (typed: string) => string[];
  // Small grey text after an option, such as its state.
  hint?: (option: string) => string | undefined;
  inputClass: string;
  autoComplete?: string;
  required?: boolean;
  invalidMessage?: string;
  // Message to show when the value isn't acceptable; empty when it is.
  validate?: (value: string) => string;
}) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const input = useRef<HTMLInputElement>(null);
  const listId = useId();
  const matches = open ? options(value) : [];

  // Keep the browser's own validation in step with the value, including when
  // it is filled in from the PIN code.
  useEffect(() => {
    input.current?.setCustomValidity(value && validate ? validate(value) : "");
  }, [value, validate]);

  function pick(option: string) {
    onChange(option);
    setOpen(false);
    setActive(-1);
  }

  return (
    <div className="relative">
      <input
        ref={input}
        name={name}
        value={value}
        required={required}
        autoComplete={autoComplete}
        role="combobox"
        aria-expanded={matches.length > 0}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
        className={inputClass}
        onChange={(event) => {
          onChange(event.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onInvalid={(event) => {
          if (event.currentTarget.validity.valueMissing && invalidMessage) {
            event.currentTarget.setCustomValidity(invalidMessage);
          }
        }}
        onInput={(event) => event.currentTarget.setCustomValidity("")}
        onKeyDown={(event) => {
          if (matches.length === 0) return;
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setActive((index) => (index + 1) % matches.length);
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setActive((index) => (index <= 0 ? matches.length - 1 : index - 1));
          } else if (event.key === "Enter" && active >= 0) {
            event.preventDefault();
            pick(matches[active]);
          } else if (event.key === "Escape") {
            setOpen(false);
          }
        }}
      />
      {matches.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute inset-x-0 top-full z-20 mt-1 max-h-64 overflow-y-auto rounded-md border border-petal bg-white py-1 shadow-lg"
        >
          {matches.map((option, index) => (
            <li
              key={option}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={index === active}
              // Pick on mouse down, before the input's blur closes the list.
              onMouseDown={(event) => {
                event.preventDefault();
                pick(option);
              }}
              className={`flex cursor-pointer items-baseline justify-between gap-3 px-4 py-2 ${
                index === active ? "bg-blush text-cherry" : "hover:bg-blush"
              }`}
            >
              <span>{option}</span>
              {hint?.(option) && <span className="text-xs text-rose">{hint(option)}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
