import "server-only";
import { site } from "../config/site.ts";

/*
 * Words for the early access form. The state, the destination, the heading
 * and the lines under it are owner settings in the site config.
 */

export const signupCopy = {
  emailLabel: "Email address",
  emailPlaceholder: "name@example.com",
  submit: site.earlyAccess.submitLabel,
  sending: "Sending…",
  /** Shown only after the destination answers with a success status. */
  success: "Thank you. Your email address was received.",
  errors: {
    empty: "Enter your email address.",
    invalid: "Enter a valid email address, like name@example.com.",
    failed: "The sign-up could not be sent. Nothing was saved. Try again later.",
  },
  referral: "Referral code",
  honeypotLabel: "Leave this field empty",
  noScript: "Sign-up needs JavaScript turned on.",
};

export type SignupCopy = typeof signupCopy;
