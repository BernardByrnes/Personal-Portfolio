"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import emailjs from "@emailjs/browser";
import { Send, CheckCircle, AlertCircle } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./ContactForm.module.css";

type FormStatus = "idle" | "sending" | "success" | "error";

export default function ContactForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!formRef.current) return;
      const fields = formRef.current.querySelectorAll(`.${styles.field}, .${styles.submitButton}`);
      gsap.fromTo(
        fields,
        { opacity: 0, y: 28 },
        {
          opacity: 1, y: 0,
          duration: 0.6, stagger: 0.08, ease: "power2.out",
          scrollTrigger: {
            trigger: formRef.current,
            start: "top 82%",
            toggleActions: "play none none none",
          },
        }
      );
    }, formRef);
    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Custom validation
    const form = e.currentTarget;
    const formData = new FormData(form);
    const name = formData.get("from_name") as string;
    const email = formData.get("from_email") as string;
    const subject = formData.get("subject") as string;
    const message = formData.get("message") as string;

    const errors: Record<string, string> = {};
    if (!name || name.trim().length < 2) errors.from_name = "Name must be at least 2 characters.";
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.from_email = "Please enter a valid email address.";
    if (!subject || subject.trim().length < 5) errors.subject = "Subject must be at least 5 characters.";
    if (!message || message.trim().length < 20) errors.message = "Message must be at least 20 characters.";

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});
    setStatus("sending");
    setErrorMessage("");

    try {
      const result = await emailjs.sendForm(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
        formRef.current!,
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
      );

      if (result.status === 200) {
        setStatus("success");
        formRef.current?.reset();
        setTimeout(() => setStatus("idle"), 5000);
      }
    } catch (error: unknown) {
      setStatus("error");
      const msg = error && typeof error === "object" && "text" in error
        ? String((error as { text: unknown }).text)
        : "Failed to send message. Please try again.";
      setErrorMessage(msg);
    }
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className={styles.form}
      noValidate
      aria-label="Contact form"
    >
      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="from_name">Name</label>
          <input
            type="text"
            id="from_name"
            name="from_name"
            disabled={status === "sending"}
            placeholder="Your name"
            aria-invalid={!!validationErrors.from_name}
          />
          {validationErrors.from_name && <span className={styles.errorText}>{validationErrors.from_name}</span>}
        </div>

        <div className={styles.field}>
          <label htmlFor="from_email">Email</label>
          <input
            type="email"
            id="from_email"
            name="from_email"
            disabled={status === "sending"}
            placeholder="your@email.com"
            aria-invalid={!!validationErrors.from_email}
          />
          {validationErrors.from_email && <span className={styles.errorText}>{validationErrors.from_email}</span>}
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="subject">Subject</label>
        <input
          type="text"
          id="subject"
          name="subject"
          disabled={status === "sending"}
          placeholder="What's this about?"
          aria-invalid={!!validationErrors.subject}
        />
        {validationErrors.subject && <span className={styles.errorText}>{validationErrors.subject}</span>}
      </div>

      <div className={styles.field}>
        <label htmlFor="message">Message</label>
        <textarea
          id="message"
          name="message"
          rows={5}
          disabled={status === "sending"}
          placeholder="Tell me about your project..."
          aria-invalid={!!validationErrors.message}
        />
        {validationErrors.message && <span className={styles.errorText}>{validationErrors.message}</span>}
      </div>

      {/* Live region for screen readers */}
      <div role="status" aria-live="polite" aria-atomic="true" className={styles.srOnly}>
        {status === "success" && "Message sent successfully. I'll get back to you within 24 hours."}
        {status === "error" && `Error: ${errorMessage}`}
      </div>

      <button
        type="submit"
        disabled={status === "sending" || status === "success"}
        className={styles.submitButton}
        data-status={status}
      >
        {status === "idle" && (<><Send size={16} /><span>Send Message</span></>)}
        {status === "sending" && (<><div className={styles.spinner} aria-hidden="true" /><span>Sending...</span></>)}
        {status === "success" && (<><CheckCircle size={16} /><span>Sent Successfully!</span></>)}
        {status === "error" && (<><AlertCircle size={16} /><span>Try Again</span></>)}
      </button>

      {status === "error" && (
        <div className={styles.errorMessage} role="alert">{errorMessage}</div>
      )}
      {status === "success" && (
        <div className={styles.successMessage}>
          Thanks! I&apos;ll get back to you within 24 hours.
        </div>
      )}
    </form>
  );
}
