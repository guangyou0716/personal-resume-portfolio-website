"use client";

import { Icon } from "./icon";

export default function PrintButton() {
  return <button className="button button--primary print-button" type="button" onClick={() => window.print()}>Print / save PDF <Icon name="download" /></button>;
}
