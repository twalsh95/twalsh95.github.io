# walshclassroom.com

The home page for Mr. Walsh's classroom apps, games, and tools. Hosted free on GitHub Pages.

## How it works

This repo is named `twalsh95.github.io`, which makes it your GitHub **user site**. Because it
has the custom domain walshclassroom.com, GitHub also serves **every one of your repos that has
Pages turned on** at `walshclassroom.com/<repo-name>/`:

| Repo                 | Address                                       |
|----------------------|-----------------------------------------------|
| twalsh95.github.io   | walshclassroom.com (this home page)           |
| narrative-studio-2   | walshclassroom.com/narrative-studio-2/        |
| guide-match          | walshclassroom.com/guide-match/               |
| triton-alumni-portal | walshclassroom.com/triton-alumni-portal/ (hidden: no tile) |

Each app keeps its own repo, and you keep pushing to it the way you do now. Old
`twalsh95.github.io/...` links redirect to the new addresses on their own.

To keep a repo off walshclassroom.com, turn its Pages off, or give it its own domain
in that repo's Settings > Pages.

## Files

```
index.html        The home page
apps.js           THE APP LIST. Edit this to add or change tiles.
404.html          "Page not found"
CNAME             Tells GitHub Pages to use walshclassroom.com
publish-site.bat  Double-click to publish your changes
```

## Add an app

1. In the app's repo: Settings > Pages > deploy from the `main` branch. It appears at `walshclassroom.com/<repo-name>/`.
2. Add a block to `apps.js` with `href: "/<repo-name>/"`.
3. Double-click `publish-site.bat`.

Email/password sign-in (what Narrative Studio uses) works on any domain. If an app ever uses
Google sign-in or email-link sign-in, add `walshclassroom.com` under Firebase console >
Authentication > Settings > Authorized domains, or those sign-ins will fail.

## Going live (one time)

1. **Create the repo.** Go to github.com/new and name it exactly `twalsh95.github.io`. Make it **Public** and don't add a README.
2. **Upload this folder.** Commit it and push to `main`.
3. **Turn on Pages.** In the repo: Settings > Pages > Source: **Deploy from a branch**, branch `main`, folder `/ (root)`. Under Custom domain enter `walshclassroom.com` and Save.
4. **Point the domain (Cloudflare dashboard > walshclassroom.com > DNS > Records).** Delete any existing A/AAAA/CNAME records for `@` and `www`, then add:

   | Type  | Name | Content                | Proxy status |
   |-------|------|------------------------|--------------|
   | A     | @    | 185.199.108.153        | DNS only (grey cloud) |
   | A     | @    | 185.199.109.153        | DNS only |
   | A     | @    | 185.199.110.153        | DNS only |
   | A     | @    | 185.199.111.153        | DNS only |
   | CNAME | www  | twalsh95.github.io     | DNS only |

   Keep the cloud grey (DNS only). An orange cloud stops GitHub from issuing the HTTPS certificate.
5. **Turn on HTTPS.** Back in Settings > Pages, once the DNS check passes (minutes to a few hours), tick **Enforce HTTPS**.
6. **Optional but smart:** GitHub profile Settings > Pages > Add a domain. Verifying it stops anyone else from claiming walshclassroom.com on GitHub.
