# TODO - Projects module standardization (phase)

- [ ] Align backend controllers/projectController.js with projects_schema.sql as the single source of truth.
- [ ] Implement centralized validation for create + update (required fields, string lengths, progress range, allowed status/priority values, dates).
- [ ] Standardize request payload mapping (exact payload shape; no aliases; no extra fields).
- [ ] Standardize response format for all Projects endpoints: { success: true/false, message, data }.
- [ ] Standardize list endpoint: GET /projects always returns {success:true,data:[...]}; handle empty lists.
- [ ] Standardize create flow: validate -> BEGIN -> INSERT -> COMMIT -> return created project (no raw rows).
- [ ] Standardize update flow: same validation as create; update only editable fields; set updated_at/updated_by; return updated project.
- [ ] Remove development code: console.log/console.warn/commented code/temp helpers inside Projects module.
- [ ] Improve error handling messages for predictable client errors (duplicate name, invalid status/priority, progress out of range, project not found, save failed).
- [ ] Frontend: standardize payload in AddProjectScreen and (if present) Edit/Add flow.
- [ ] Frontend: refactor ProjectContext to be the single source of truth; refresh state immediately after API success.
- [ ] Update Plans/tests once edits are applied (sanity run: lint/unit if available).

- [ ] Frontend: ProjectsScreen should render from ProjectContext only (remove redundant local state that duplicates context).
- [ ] Frontend: ensure edit mode populates existing values correctly and does not clear fields.
- [ ] Verification: create/edit/delete/list/details/refresh + no HTTP 500 errors during normal operations; no React warnings/console errors remain.

