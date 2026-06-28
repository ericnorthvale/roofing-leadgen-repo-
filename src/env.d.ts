/// <reference types="astro/client" />

// astro:env schemas are generated from astro.config.mjs at build time.
// This file exists to keep IDEs happy and declare any extra ambient types.

declare namespace App {
  interface Locals {
    // request-scoped state set by middleware (e.g., geo, session, UTMs)
    utm?: {
      source?: string;
      medium?: string;
      campaign?: string;
      content?: string;
      term?: string;
    };
    geo?: {
      city?: string;
      region?: string;
      country?: string;
      zip?: string;
    };
  }
}
