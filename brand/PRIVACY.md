# Student privacy: what's in place and what's left

Written Nov 17 2026. Not legal advice: have ACS (or a district's privacy officer) review the policy before relying on it.

## On the site
- `/privacy/`: student privacy policy (plain language; FERPA school-official, COPPA under-13 school consent, no ads/tracking/selling/AI training, who sees what, 30-day deletion, breach notice, families' rights).
- `/privacy/schools/`: for district privacy and IT staff. Data inventory in the SDPC Exhibit B shape, service providers, domains to allow in a web filter, how to get a signed agreement.
- Footer links (Privacy, For schools) on every hub page; a privacy note on the Make an account form.
- Crawler and filter signals: `robots.txt`, `sitemap.xml`, `/.well-known/security.txt`, an education-focused home page description, and schema.org `WebSite` data with an `EducationalAudience`.

## Facts the policy states (keep them true)
- No analytics, ads, trackers or AI anywhere in the hub, Narrative Studio or Guide Match (checked Nov 17 2026: the only outside services are Google Firebase, Google Fonts, GitHub Pages and Cloudflare).
- Account data: name, email, hashed password (Firebase Auth), role. Saved work: Narrative Studio only. Claymation saves to the device. Guide Match saves nothing.
- Deletion within 30 days of a request. Breach notice to schools and families.
- **If a new app adds analytics, AI, a new service provider, or a new kind of data, update both pages first.**

## Tom's to-do
1. **Confirm where Firebase stores data.** Firebase console > Project settings > General > "Default GCP resource location". If it's in the US (e.g. `nam5` or `us-east1`), add "stored in the United States" to both pages; districts often ask.
2. **Read both pages and agree to the commitments** in them, especially: deleting within 30 days, signing district agreements, and the Exhibit E general offer.
3. **Have ACS review** the policy (the tech director or whoever handles student data privacy).
4. **Sign the first agreement with ACS.** Massachusetts districts use the Student Data Privacy Consortium (SDPC) Massachusetts agreement (sdpc.a4l.org). ACS starts it; you sign as the provider; tick Exhibit E so other districts can adopt it. Once signed, it appears in the SDPC registry, which is what other districts search when vetting a site.
5. **Get the site categorized as Education** so filters that block uncategorized sites let it through:
   - Ask ACS IT to submit walshclassroom.com as Education in whatever filter ACS uses (GoGuardian and Securly admins both have a "suggest a category" option).
   - Securly also takes domain submissions by email at support@securly.com.
   - Other districts' IT can do the same; `/privacy/schools/` lists the domains to allow.
6. **Optional, later:** self-host the three fonts to drop Google Fonts as a service provider (one fewer third party for vetting). A Common Sense Privacy evaluation is another signal some districts look for.

## Worth knowing about filters
School filters (GoGuardian, Securly, Lightspeed and others) mostly decide by **category**, not by reading a privacy policy. New or uncategorized domains are the usual reason a site is blocked, and a site full of the word "games" can be categorized as Games, which many schools block. The "Games" bin was renamed "Skill builders" on Nov 17 2026 for this reason. Keep "game" out of hub copy; if a purely-for-fun game is ever added, put it on a page that isn't linked from the home page.
