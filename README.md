# Study Buddy AI

A beginner-friendly study helper with an AI tutor, note summarizer, quiz maker, and homework tracker.

## What's included

- `index.html`, `style.css`, `app.js`: the browser app.
- `api/study.js`: server-side AI endpoint. The browser never receives the API key.
- `vercel.json`: deploy configuration for Vercel.
- Homework tasks are saved locally in the current browser.

## Important security rule

**Never put your real OpenAI API key in `index.html`, `app.js`, `.env.example`, or any GitHub file.** Set it only in your hosting provider's environment-variable settings. API usage may cost money; set a budget/usage limits in your API account and do not share the key.

## Beginner setup: GitHub + Vercel

### 1. Create your GitHub repository

1. Sign in to GitHub.
2. Open <https://github.com/new>.
3. Name it `study-buddy` (GitHub repository names generally work best without spaces).
4. Choose **Public** if you want the code visible, or **Private** if you prefer.
5. Leave **Add a README** unchecked because this project already includes one.
6. Click **Create repository**.

### 2. Upload the project files

1. Download and unzip the project ZIP.
2. On the new repository page, select **Add file → Upload files**.
3. Upload the files and folders from inside the `study-buddy-ai` folder. Make sure `api/study.js` stays inside the `api` folder.
4. Enter the commit message `Add Study Buddy AI app`, then click **Commit changes**.

### 3. Deploy it on Vercel

1. Open <https://vercel.com/> and sign in. Use the option to continue with GitHub.
2. Choose **Add New → Project**, then import your `study-buddy` repository.
3. Keep the default settings and deploy. If asked for a framework, choose **Other**.
4. If the first deployment fails, check that `vercel.json` and the `api` folder are in the repository root.

### 4. Add the AI key safely

1. Create or use an OpenAI API account at <https://platform.openai.com/api-keys>. API billing is separate from a ChatGPT subscription.
2. Create an API key. Treat it like a password. Do not send it in chat, screenshots, or GitHub.
3. In Vercel, open your project → **Settings → Environment Variables**.
4. Add the variable name `OPENAI_API_KEY` and paste the secret key into its **Value** field.
5. Optionally add `OPENAI_MODEL` with value `gpt-4.1-mini`. If you skip this, the app already uses that model by default.
6. Save, then open **Deployments** and redeploy the latest deployment so the function receives the new variable.
7. Open the deployed site and test the AI Tutor, Summarizer, and Quiz Maker.

## If something goes wrong

- **“AI isn't configured yet”**: the `OPENAI_API_KEY` variable is missing or the latest deployment needs redeploying.
- **“API key was rejected”**: check the secret in Vercel settings. Never put it into frontend code.
- **Quota / busy message**: check API usage and billing at the OpenAI platform.
- **AI server isn't connected yet**: confirm the site was deployed on Vercel and that `api/study.js` exists in the repository.
- **Homework not saved between devices**: assignments are stored in this browser only; they are not synced.

## Notes

- The AI can make mistakes. Verify important facts and schoolwork.
- The endpoint limits input to 12,000 characters.
- This starter does not include user accounts, shared cloud homework, or a custom rate limiter. Before sharing it widely, add usage limits/rate limiting to help prevent unexpected API costs.
