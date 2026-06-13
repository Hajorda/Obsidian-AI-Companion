---
title: Tone Adjustment
description: Rewrite any selected text in a specific tone — Formal, Casual, Academic, Friendly, or Blunt — with one click.
prev:
  text: Inline AI Editor
  link: /guide/inline-editor
next:
  text: Diff Preview
  link: /guide/diff-preview
---

# Tone Adjustment

Tone adjustment lets you instantly rewrite selected text in a specific emotional register — without changing the underlying meaning. It's one of the fastest actions in AI Companion: select text, click a tone, see the diff.

---

## The Five Tones

### 🎩 Formal

**Character:** Professional, authoritative, and polished. No contractions. Complete sentences. Appropriate for professional correspondence, reports, and documents intended for a general audience in a business or institutional context.

**What it changes:**
- Contractions replaced: *"I'll"* → *"I will"*, *"don't"* → *"do not"*
- Casual words upgraded: *"get"* → *"obtain"*, *"use"* → *"utilize"*
- Sentence structure tightened
- Hedging language made more definitive

**Use when:** Writing to a client, drafting a report, composing a professional email, creating documentation for external audiences.

---

### 😊 Casual

**Character:** Friendly, relaxed, and conversational — like writing to a friend or colleague you know well. Contractions are fine. Short sentences and paragraph breaks encouraged. Natural rhythm over formal correctness.

**What it changes:**
- Formal words simplified: *"however"* → *"but"*, *"therefore"* → *"so"*
- Contractions added where natural
- Passive voice converted to active
- Stiff phrasing loosened

**Use when:** Slack messages, team updates, personal notes, blog posts aimed at a general audience, informal emails.

---

### 🎓 Academic

**Character:** Scholarly, precise, and rigorous. Uses disciplinary vocabulary, hedged claims (*"suggests that"*, *"it may be argued"*), and structured argument. Avoids overgeneralizations and unsubstantiated claims.

**What it changes:**
- Bold claims hedged: *"This proves"* → *"This suggests"*
- Vocabulary elevated to field-appropriate terminology
- Passive voice used where academically conventional
- Logical connectors added: *"Furthermore"*, *"Consequently"*, *"In contrast"*

**Use when:** Research notes, paper drafts, literature review summaries, grant writing, thesis sections.

---

### 🤗 Friendly

**Character:** Warm, encouraging, and empathetic. Acknowledges the reader's perspective. Uses inclusive language (*"we"*, *"let's"*). Ends on a positive or supportive note. Less formal than Formal but more thoughtful than Casual.

**What it changes:**
- Cold or neutral phrasing warmed: *"You need to"* → *"You might want to"*
- Empathetic openers added where appropriate
- Harsh language softened
- Positive framing emphasized

**Use when:** Feedback, mentorship notes, team communications, user-facing documentation, customer support responses.

---

### ⚡ Blunt

**Character:** Direct, economical, and unhedged. Cuts filler, qualifications, and diplomatic softening. Says what it means immediately. No wasted words.

**What it changes:**
- Hedges removed: *"It might be worth considering"* → *"Consider this"`
- Filler phrases cut: *"In terms of"*, *"at the end of the day"*, *"going forward"*
- Passive → active: *"A decision was made"* → *"We decided"*
- Long sentences split or shortened

**Use when:** Executive summaries, bullet-point lists, technical documentation, action items, situations where clarity beats diplomacy.

---

## How to Use Tone Adjustment

1. **Select the text** you want to rewrite in your note
2. Press <kbd>Cmd</kbd>+<kbd>Shift</kbd>+<kbd>A</kbd> (Mac) / <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>A</kbd> (Windows/Linux)
3. In the Tone row, **click the desired tone button**
4. The AI rewrites the text and the **Diff Preview** opens automatically
5. Review the changes and click **Accept** or **Reject**

The whole process takes 2–5 seconds depending on text length and model.

::: tip Tone affects meaning less than Style
Tone changes *how* something is said — the level of formality and emotional warmth. It does not change *what* is said or restructure the content. For structural transformation (e.g., turning notes into a tweet or press release), use the [Style panel](/guide/inline-editor#style-panel) instead.
:::

---

## Tone Comparison Example

Here's the same sentence in each tone:

> **Original:** *"We didn't hit the Q2 numbers and need to figure out what went wrong."*

| Tone | Result |
|---|---|
| **Formal** | *"The organization did not achieve its Q2 targets, and it is necessary to conduct a thorough analysis of the contributing factors."* |
| **Casual** | *"We missed Q2, so let's dig into what happened."* |
| **Academic** | *"The Q2 performance metrics fell short of projected targets, suggesting a need for systematic evaluation of causal variables."* |
| **Friendly** | *"It looks like we didn't quite hit Q2, but that's okay — let's work together to understand what we can learn from it."* |
| **Blunt** | *"We missed Q2. Find out why."* |

---

## Tips

::: tip Apply tone to a single paragraph
Tone adjustment works best on a single coherent paragraph or section. Applying it to an entire long document may produce inconsistent results as the AI has to balance multiple contexts.
:::

::: info Multiple passes
You can run tone adjustment multiple times on the same text. Each pass further reinforces the target register. For example, running **Blunt** twice will produce increasingly terse results.
:::

::: warning Don't lose nuance
**Academic** and **Formal** tones can sometimes strip out intentional informality that's part of your voice. Always review the diff before accepting. Use **Reject** freely — it has zero cost.
:::
