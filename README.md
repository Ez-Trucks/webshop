# EZ-Trucks website

The existing Angular 20 website for Eeckeleers & Zonen, including stock pages, an admin panel, depannage requests and the AI Advertisement Assistant. The backend is maintained in `Ez-Trucks/webshop-api`.

## Development

Use Node.js 22.

```bash
npm ci
npm start
```

Development defaults to `http://localhost:3000`. Set `EZ_TRUCKS_API_URL` at build time to use another API. This is a public URL, never an API key or password. See `.env.example`; `.env` files are not automatically loaded by the build script, so provide this variable through the shell or Vercel environment settings.

## Release checks and production build

```bash
node scripts/test-api-boundary.cjs
npm run build
```

GitHub Actions runs both checks on the release branch and pull request. The token-boundary check executes the actual interceptor code and verifies that the admin session is sent only to the configured API origin and path.

## Existing Vercel deployment

- Build command: `npm run build`
- Output directory: `dist/dafwebshop/browser`
- Set `EZ_TRUCKS_API_URL` to the actual Render API origin in the appropriate Vercel environment.
- `vercel.json` provides SPA routing, disables indexing of admin/login routes and prevents caching the runtime API configuration.

Deploy the backend and its additive database migrations first. Then deploy this frontend. Keep the existing domain configuration. In the admin dashboard, **Status van de website** checks whether the API, vehicle fields, draft storage and server settings are available. Presence of a mail/AI key is not proof of successful delivery or account access.

## Admin features

- `/admin`: dashboard and server readiness checks.
- `/admin/products`: existing vehicle management, photos, stock and technical fields.
- `/admin/orders`: stored depannage enquiries.
- `/admin/ad-assistant`: private drafts with VIN, notes, documents and photos; source review; per-field confirmations; editable NL/EN/FR/DE descriptions; approval before website publication; text export for Autoline.

If AI is not configured on the server, the assistant clearly disables AI actions while keeping manual editing and standard text generation available. Standard descriptions translate field labels only; review or translate entered free-text values yourself.

Known source/fact changes invalidate old generated descriptions. Route changes and page refresh warn about unsaved edits. Published vehicles are edited through the existing vehicle manager. The public site currently uses the Dutch description, and direct Autoline publishing requires a separate official account integration.

Before launch, verify the business email/contact details and test one authorised real enquiry and a test advertisement. The stock and admin pages are functional without the previously disabled cart/checkout routes. No demo user, demo transport interception or fake AI response is shipped in this production source. The separate private ChatGPT preview uses browser-local demo data only.
