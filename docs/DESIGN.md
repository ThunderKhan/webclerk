# webclerk Design Specification

## Purpose

Milestone 1 deliberately presents webclerk as a realistic Indian public-service application rather than a polished consumer SaaS dashboard. The visual contrast is part of the WebMCP demonstration: a dense, procedural form can remain familiar to citizens while an agent gains a structured semantic interface in later milestones.

This is a fictional hackathon prototype. It must never imply affiliation with, endorsement by, or operation by the Government of India, a state government, a ministry, NIC, Digital India, or any real scholarship programme.

## Primary references

The design is informed by official Government of India guidance rather than a generic template:

1. **UX4G Design System 3.0** — Government of India design system for accessible, scalable citizen-facing services. It provides reusable components, patterns, tokens and government-service flows.
   - https://www.ux4g.gov.in/
   - https://doc.ux4g.gov.in/
2. **Guidelines for Indian Government Websites and Apps (GIGW 3.0)** — official guidance covering usability, accessibility, identity, forms and citizen-centred content.
   - https://guidelines.india.gov.in/
   - https://guidelines.india.gov.in/designing-accessible-and-usable-forms/

We use these references as design guidance. Milestone 1 does not claim formal UX4G or GIGW certification.

## Design intent

The interface should feel immediately recognisable as an Indian e-governance workflow:

- thin tricolour identity strip;
- bilingual Hindi/English institutional header;
- restrained navy government-service navigation;
- breadcrumb trail;
- application/reference number and deadline;
- dense but clearly grouped form sections;
- mandatory-field convention using text + asterisk, never colour alone;
- status notices and warnings with visible copy;
- rectangular controls with limited decorative styling;
- explicit Save as draft / Save & continue workflow;
- official-looking information hierarchy without using a real ministry logo or State Emblem.

The experience should look competent but procedural. We intentionally avoid turning it into a glossy AI dashboard because the product thesis depends on improving an interface citizens already recognise.

## Prototype identity guardrails

Realism must not become impersonation.

Required on every primary screen:

- `DEMO / NOT OFFICIAL` mark in the header;
- a visible prototype notice explaining that the scholarship and department are fictional;
- fictional application and certificate identifiers;
- no real State Emblem of India;
- no claim that webclerk is a government website;
- footer states that the interface is a WebMCP Challenge prototype.

The circular `भारत` seal is intentionally a generic prototype mark, not the State Emblem.

## Information architecture

### Global shell

1. tricolour accent
2. accessibility/utility bar
3. institutional identity
4. primary navigation
5. breadcrumbs
6. service content
7. government-style footer

### Application page

The page has four layers of state:

1. **Application identity** — scheme, application ID, deadline.
2. **Progress state** — completion, verified/review/blocked/incomplete counts.
3. **Application form** — four logical sections.
4. **Evidence panel** — uploaded documents and their readiness.

Desktop layout uses a roughly 70/30 split between the application and evidence surfaces. On narrower screens, the evidence panel follows the form.

## Form structure

Following GIGW form guidance, questions are grouped logically and labels remain explicit.

### 1. Personal Details

Identity and contact information.

### 2. Academic Details

Institution, programme, enrollment and previous performance.

### 3. Family & Income Details

Household financial details. The income label explicitly says `gross` and the helper text specifies the period and unit, reflecting GIGW guidance that questions such as income should be precise.

### 4. Eligibility & Declaration

Domicile, category, other scholarship state and final human declaration.

## Semantic status language

Status must never be represented by colour alone.

### Verified

- green edge/accent;
- text badge `Verified`;
- source is shown when available.

### Needs confirmation

- amber edge/accent;
- text badge `Needs confirmation`;
- explanation states why the document set cannot establish the answer.

### Blocked

- red edge/accent;
- text badge `Blocked`;
- explicit conflict or validity explanation.

### Not completed

- neutral edge/accent;
- text badge `Not completed`.

These states are the visual precursor to the WebMCP semantic field model.

## Seeded demo conflicts

Milestone 1 intentionally exposes problems that later WebMCP tools must understand:

1. **Annual family income**
   - form: ₹350,000
   - evidence: ₹320,000
   - state: blocked
2. **Income certificate**
   - issued 10 June 2025
   - application occurs after the 12-month accepted window
   - state: blocked/warning
3. **Ambiguous/self-declared fields**
   - gender, contact data, study mode, dependents, category and existing-scholarship declaration cannot be silently inferred
   - state: needs confirmation
4. **Final declaration**
   - starts empty
   - deliberately remains a human action

## Typography

Preferred stack:

`Noto Sans`, `Segoe UI`, Arial, sans-serif.

Noto Sans is compatible with multilingual Indian text and reflects the restrained typography used in government-service systems. System fallbacks keep the prototype dependency-light.

## Colour strategy

The design uses restrained government-service colours rather than a branded consumer palette:

- institutional navy for navigation and primary actions;
- saffron/white/green only as a thin national-context accent;
- neutral greys for page chrome and borders;
- green for verified;
- amber for review/attention;
- red for blocked/conflict.

Colour is supplemental; text always carries the state meaning.

## Accessibility baseline

Milestone 1 should include:

- skip-to-content link;
- one page-level `h1` in the institutional header and structured subordinate headings;
- explicit form labels;
- programmatic label-control association;
- visible focus styles;
- keyboard-operable tabs/buttons/fields;
- semantic status text in addition to colour;
- responsive layout;
- concise field instructions;
- no tables for page layout.

This follows the direction of GIGW 3.0 and WCAG-oriented UX4G guidance, but formal conformance testing remains a later hardening task.

## Deliberate non-goals for Milestone 1

- official State Emblem or ministry branding;
- pixel-perfect reproduction of a specific government portal;
- UX4G npm dependency merely for visual authenticity;
- WebMCP registration;
- LLM or OCR features;
- real scholarship data;
- production identity/authentication flows.

The goal is a believable citizen-service surface with a clean semantic state model underneath, ready for Milestones 2 and 3.
