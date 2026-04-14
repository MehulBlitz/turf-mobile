---
description: "Create or update a reusable Copilot skill file under .github/skills/<name>/SKILL.md from a natural-language request."
name: "Create Skill"
argument-hint: "skill name + what it should do (example: ui-visuals for Background Studio waves, Shape Magic containers, Texture Lab noise)"
agent: "agent"
---
Create or update a skill specification for this repository.

User request:
- `${input:request}`

Requirements:
1. Parse a skill name from the request. If missing, ask a concise follow-up question.
2. Target path must be `.github/skills/<skill-name>/SKILL.md`.
3. Create the folder if needed, then create or update `SKILL.md`.
4. Ensure valid YAML frontmatter at the top:
   - `name: <skill-name>`
   - `description: <clear trigger-oriented description>`
5. Skill content must include:
   - Purpose and trigger phrases ("Use this skill when...")
   - Concrete implementation guidance
   - A repeatable workflow/checklist
   - At least one code or usage example when relevant
6. Keep the instructions actionable and scoped to coding tasks.
7. Preserve existing repository conventions and avoid unrelated edits.

Output format:
- Created/updated file path
- Final frontmatter block
- 2 sample invocations (including `/create-skill ...`)
- Any assumptions or follow-up questions
