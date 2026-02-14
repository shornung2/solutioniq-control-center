

# Add Skills Marketplace and Tools Status to Settings Page

## Overview
Add two new cards to the Settings page: a "Skills Marketplace" for installing/uninstalling AI skills with category filtering, and a "Tools Status" card showing tool availability from a deep health check.

## Changes

### 1. Add types to `src/lib/types.ts`

```text
SkillLibraryItem {
  name: string
  version: string
  category: string
  description: string
  preferred_lane: string
  trigger_keywords: string[]
  estimated_cost: number
}

InstalledSkill {
  id: string
  name: string
  installed_at: string
  config: Record<string, unknown>
}

HealthDeep {
  tools: Record<string, { available: boolean }>
}
```

- `SkillLibrary` = `Record<string, SkillLibraryItem>`

### 2. Update `src/pages/Settings.tsx`

Add all skill/tools logic directly in the Settings page (keeping it self-contained like the existing pattern).

**Data fetching (React Query):**
- `useQuery("skills-library")` -- `api.get("/skills/library")` returns `Record<string, SkillLibraryItem>`
- `useQuery("skills-installed")` -- `api.get("/skills/installed")` returns `InstalledSkill[]`
- `useQuery("health-deep")` -- `api.get("/health/deep")`

**Skills Marketplace Card (inserted above Capabilities card):**
- Tab filter row at top: All | Research | Documents | Creative | Communication | Knowledge | Browser
- Each skill rendered as a row with:
  - Name (bold) + Category badge (colored: research=blue, documents=green, creative=purple, communication=yellow, knowledge=gray, browser=orange)
  - Description (muted, small text)
  - Estimated cost: "$0.12/use" format
  - Preferred lane badge (outline)
  - Switch toggle: checked if skill name is in installed list
- Toggle ON: `api.post("/skills/{name}/install", {})`, invalidate queries, success toast
- Toggle OFF: `api.delete("/skills/{id}")` using the installed skill's `id`, invalidate queries, success toast
- Loading state: Skeleton rows
- Empty state: "No skills available"

**Category badge color mapping:**
- research: `bg-blue-500/10 text-blue-500 border-blue-500/20`
- documents: `bg-green-500/10 text-green-500 border-green-500/20`
- creative: `bg-purple-500/10 text-purple-500 border-purple-500/20`
- communication: `bg-yellow-500/10 text-yellow-500 border-yellow-500/20`
- knowledge: `bg-gray-500/10 text-gray-500 border-gray-500/20`
- browser: `bg-orange-500/10 text-orange-500 border-orange-500/20`

**Tools Status Card (inserted after Skills Marketplace, before Capabilities):**
- Fetches `/health/deep`
- Displays 4 tool rows:
  - Web Search -- checks `tools.web_search.available`
  - Document Production -- always true (bundled)
  - Image Generation -- checks `tools.image_generation.available`
  - Browser Automation -- checks `tools.browser.available`
- Each row: icon (CheckCircle2 green or XCircle red) + tool name + "Available" / "Not configured" text
- Loading state: Skeleton rows

**Mutation handling:**
- Use `useMutation` from React Query for install/uninstall
- On success: invalidate `["skills-installed"]` query key and show toast
- Disable the Switch while mutation is pending to prevent double-clicks

## Technical Details

**Tab filter implementation:**
- State: `activeCategory` string, default "all"
- Filter skills list: if "all", show everything; otherwise filter by `skill.category === activeCategory`
- Tabs use small Button components with `variant="ghost"` or `variant="secondary"` for active state

**Installed skill lookup:**
- Create a Map from `installedSkills` array: `name -> id` for quick lookup
- Switch `checked` = `installedMap.has(skill.name)`
- On uninstall, use `installedMap.get(skill.name)` to get the `id` for the DELETE call

**Cost formatting:**
- `$${skill.estimated_cost.toFixed(2)}/use`

**Files changed:**
- `src/lib/types.ts` -- add SkillLibraryItem, InstalledSkill, HealthDeep interfaces
- `src/pages/Settings.tsx` -- add Skills Marketplace card, Tools Status card, queries, mutations

