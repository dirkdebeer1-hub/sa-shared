# SA Accountants Shared Assets

Single source of truth for shared utilities and design system.
Edit ONLY here. All modules load from the deployed URL.

## Deployed URL
https://sa-shared.vercel.app

## Files
- `utils.js`   — showToast, apiFetch, fmt, formatNumber, parseSalaryInput
- `shared.css` — design tokens, base resets, shared components

## Load order in every module's index.html
```html
<link  rel="stylesheet" href="https://sa-shared.vercel.app/shared.css?v=1.0.0">
<script src="https://sa-shared.vercel.app/utils.js?v=1.0.0"></script>
<script src="js/config.js"></script>   <!-- always local per module -->
<script src="js/[module].js"></script>
```

## Version pinning
The `?v=` pin protects running apps from breaking on updates.
Only bump the pin in a module after testing the new shared version.

## Modules using this
| Module    | Repo                        | Status  |
|-----------|-----------------------------|---------|
| Payroll   | sa-payroll-app              | ACTIVE  |
| Tax       | sa-tax-app (planned)        | PLANNED |
| Comp Sec  | sa-company-sec (planned)    | PLANNED |
| Dashboard | sa-home-dashboard (planned) | PLANNED |

## To update a shared file
1. Edit `utils.js` or `shared.css` in THIS repo only
2. Bump `window._SA_SHARED_UTILS_VERSION` (utils.js) or comment version (shared.css)
3. Push — Vercel auto-deploys in ~30 seconds
4. Test in payroll app by adding `?v=NEW` to the script src
5. Once confirmed working, update the pin in each module's `index.html`
