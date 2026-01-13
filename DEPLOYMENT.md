GitHub Pages Deployment

This repository is configured to automatically build and deploy the Vite app to **GitHub Pages** when commits are pushed to the `main` branch.

Workflow: `.github/workflows/deploy-pages.yml`

What it does:
- Installs Node.js and dependencies
- Runs `npm run build`
- Uploads the `dist/` folder as a Pages artifact
- Publishes the artifact to GitHub Pages

Expected site URL
- If your repository is `https://github.com/<owner>/<repo>`, the Pages site will usually be available at `https://<owner>.github.io/<repo>/` after the first successful deployment.

Badge (paste into `README.md` to show workflow status):

```
![Deploy to Pages](https://github.com/joeyroberts0305-zsmy/speckit-photo-organizer/actions/workflows/deploy-pages.yml/badge.svg)
```

Notes:
- The first deployment may take a minute or two to become available.
- If your repo requires any special build environment variables (currently not required), add them in the repo settings as Actions secrets and update the workflow to consume them.
- You can customize the published path by editing the workflow's `path` under `actions/upload-pages-artifact@v1`.
