"use client";

import { CircleAlert } from "lucide-react";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import type { SignupCopy } from "@/content/early-access";
import { cn } from "@/lib/cn";
import { useReferralCode, type ReferralSettings } from "@/lib/referral";

type SignupFormProps = {
  /** URL that receives the sign-up. From `site.earlyAccess.destination`. */
  destination: string;
  referral: ReferralSettings;
  copy: SignupCopy;
};

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "done" }
  /** `field`: the email itself is wrong, so the input is marked invalid. */
  | { kind: "error"; message: string; field: boolean };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMAIL_MAX = 254;
const TIMEOUT_MS = 15_000;
/** A field people never see. A value in it means a script filled the form. */
const HONEYPOT = "website";

/**
 * The early access form: one email field. It posts `email`, plus the
 * visitor's referral code when they arrived with a valid one, as a
 * form-encoded body. The success message appears only after the destination
 * answers with a success status; anything else is reported as a failure.
 */
export function SignupForm({ destination, referral, copy }: SignupFormProps) {
  const id = useId();
  const emailId = `${id}-email`;
  const errorId = `${id}-error`;
  const code = useReferralCode(referral);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const email = useRef<HTMLInputElement>(null);
  const done = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (status.kind === "done") done.current?.focus();
    if (status.kind === "error" && status.field) email.current?.focus();
  }, [status]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status.kind === "sending") return;
    const data = new FormData(event.currentTarget);
    const address = String(data.get("email")).trim();
    if (address === "") {
      setStatus({ kind: "error", message: copy.errors.empty, field: true });
      return;
    }
    if (!EMAIL.test(address) || address.length > EMAIL_MAX) {
      setStatus({ kind: "error", message: copy.errors.invalid, field: true });
      return;
    }
    if (String(data.get(HONEYPOT)) !== "") {
      setStatus({ kind: "error", message: copy.errors.failed, field: false });
      return;
    }

    setStatus({ kind: "sending" });
    const body = new URLSearchParams({ email: address });
    if (code !== null) body.set(referral.queryParam, code);
    try {
      const response = await fetch(destination, {
        method: "POST",
        headers: { Accept: "application/json" },
        body,
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (!response.ok) throw new Error(`sign-up destination answered ${response.status}`);
      setStatus({ kind: "done" });
    } catch {
      setStatus({ kind: "error", message: copy.errors.failed, field: false });
    }
  };

  if (status.kind === "done") {
    return (
      <p ref={done} tabIndex={-1} role="status" data-signup="done" className="mt-6 text-lg text-rj-text">
        {copy.success}
      </p>
    );
  }

  const sending = status.kind === "sending";
  const error = status.kind === "error" ? status : null;

  return (
    <form
      noValidate
      onSubmit={onSubmit}
      aria-busy={sending}
      data-signup={status.kind}
      className="mt-6 max-w-[34rem]"
    >
      <label htmlFor={emailId} className="block text-[0.9375rem] font-medium text-rj-text">
        {copy.emailLabel}
      </label>
      <div className="mt-2 flex flex-col gap-3 sm:flex-row">
        <input
          ref={email}
          id={emailId}
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          required
          maxLength={EMAIL_MAX}
          placeholder={copy.emailPlaceholder}
          aria-invalid={error?.field === true}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            "h-12 w-full min-w-0 flex-1 rounded-lg border bg-rj-surface px-4 text-base text-rj-text placeholder:text-rj-caption",
            error?.field ? "border-rj-fail" : "border-rj-muted",
          )}
        />
        <button
          type="submit"
          disabled={sending}
          className="h-12 shrink-0 rounded-lg bg-rj-text px-6 text-base font-semibold text-rj-bg transition-opacity duration-200 hover:opacity-90 disabled:opacity-60"
        >
          {sending ? copy.sending : copy.submit}
        </button>
      </div>

      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={`${id}-${HONEYPOT}`}>{copy.honeypotLabel}</label>
        <input id={`${id}-${HONEYPOT}`} name={HONEYPOT} type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {error && (
        <p id={errorId} role="alert" className="mt-3 flex items-start gap-2 text-base text-rj-text">
          <CircleAlert aria-hidden="true" className="mt-1 size-4 shrink-0 text-rj-fail" strokeWidth={2} />
          {error.message}
        </p>
      )}
      {code !== null && (
        <p data-signup-referral="" className="mt-3 text-[0.9375rem] text-rj-caption">
          {copy.referral}: <span className="font-mono text-rj-dim">{code}</span>
        </p>
      )}
    </form>
  );
}
