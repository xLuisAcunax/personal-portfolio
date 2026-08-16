import { translate } from "../../i18n";
import { byId, query } from "../core/dom";
import type { LocaleStore } from "./language";

type Status = "idle" | "success" | "error";

/** Serialise a form as `application/x-www-form-urlencoded`, skipping files. */
function encodeForm(form: HTMLFormElement): string {
  const params = new URLSearchParams();
  new FormData(form).forEach((value, key) => {
    if (typeof value === "string") params.append(key, value);
  });
  return params.toString();
}

/**
 * Progressive enhancement for the Netlify-backed contact form: the form still
 * posts normally without JavaScript, this just submits it in the background
 * and reports the outcome inline.
 */
export function initContactForm(locale: LocaleStore): void {
  const form = byId<HTMLFormElement>("contact-form");
  const status = byId("contact-status");
  const submit = byId<HTMLButtonElement>("contact-submit");
  const submitLabel = submit ? query<HTMLElement>("[data-submit-label]", submit) : null;
  if (!form || !status || !submit || !submitLabel) return;

  const setStatus = (state: Status, key?: string): void => {
    status.dataset.state = state;
    status.textContent = key ? translate(locale.get(), key) : "";
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (submit.disabled) return;

    const idleLabel = submitLabel.textContent ?? "";
    submit.disabled = true;
    submitLabel.textContent = translate(locale.get(), "form.sending");
    setStatus("idle");

    try {
      const response = await fetch(form.getAttribute("action") || "/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: encodeForm(form),
      });

      if (response.ok) {
        form.reset();
        setStatus("success", "form.success");
        window.setTimeout(() => setStatus("idle"), 5000);
      } else {
        setStatus("error", "form.error");
      }
    } catch {
      setStatus("error", "form.networkError");
    } finally {
      submit.disabled = false;
      submitLabel.textContent = idleLabel;
    }
  });
}
