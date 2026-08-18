"use client";

export default function PrintButton() {
  return <button className="button button--primary print-button" type="button" onClick={() => window.print()}>Print / Save PDF <span aria-hidden="true">↓</span></button>;
}
