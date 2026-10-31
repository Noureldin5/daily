# Daily

A small personal app: daily habits (prayers, Sunnah, Muslim habits, health, programming, reading), a day routine, the training plan, a dhikr counter, and learning topics. It works offline and installs on your phone like a normal app.

No server and no account. Everything you tick is saved **in the browser on that device** (localStorage).

## Pages

- **Today**: a reminder of the day (ayah or hadith with its source), a short quote, your score, a 7-day bar strip and streaks. Groups fold away once everything counted in them is done. Use the arrows to fill in yesterday. Four habits tick themselves:
  - "Today's training", when every block on Train is done
  - "Dhikr, 100+", when the counter passes 100 for the day
  - "Studied a topic", when you log minutes on Learn
  - "Breathing session", when you finish a session on Breathe
- **Breathe** (from Today or Train): calm, long exhale, box, physiological sigh and 360° rib breathing, with a guided circle. The screen stays awake during a session.
- **Routine**: your normal day, with the current block highlighted. Tap Edit to change times.
- **Train**: the full training plan for each weekday, readiness buttons, calories, and a Done tick per block.
- **Dhikr**: tap the big card to count. Your phone buzzes at the target. "After-prayer tasbih" runs 33, 33, 34 and moves on by itself. Add your own dhikr at the bottom.
- **Learn**: three tracks (Study, Programming, Anything). Add topics from the ideas or your own, log time with +15, and keep notes.
- **Settings** (gear on Today): training options, edit habits, PIN lock, backup and restore.

## Put it on GitHub Pages

1. Create a new repository on GitHub, for example `daily`. Pick a name that doesn't say what it is if you like.
2. Upload every file in this folder to the root of the repo, including `.nojekyll`. Either drag the files into the GitHub web page ("Add file → Upload files") or use git:
   ```bash
   git init
   git add .
   git commit -m "Daily app"
   git branch -M main
   git remote add origin https://github.com/Noureldin5/daily.git
   git push -u origin main
   ```
3. In the repo: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, branch `main`, folder `/ (root)`, Save.
4. After a minute the site is at `https://noureldin5.github.io/daily/`.
5. On your phone, open that link:
   - **Android (Chrome):** menu → **Add to Home screen / Install app**
   - **iPhone (Safari):** Share → **Add to Home Screen**

### Updating it later

Change the files, then bump `VERSION` in `sw.js` (for example `daily-v3`) and push. Phones pick up the new version the next time the app opens with internet.

## Who can see it?

- **GitHub Free:** Pages only works from a **public** repo. Anyone can read the code, and anyone with the link can open the app.
- **Private repo:** needs a paid plan (Pro, Team or Enterprise). Even then, GitHub says the published site is still **public on the internet**. Only GitHub Enterprise Cloud can restrict who sees a Pages site.

**Your data is still private.** Your ticks, counts and notes are stored only in your own browser. Someone who opens your link sees an empty app with the default habits, not your data. Nothing you do in the app is ever sent to GitHub.

To make it more private:

- **Set a PIN** (Settings → App lock). Anyone who picks up your phone needs it to open the app. It's a lock screen, not account security.
- **Don't put anything secret in `data.js`.** It's public in the repo.
- **`noindex` is already set**, so search engines won't list the page.
- **Want a real login?** Host the same files on Cloudflare Pages and turn on Cloudflare Access (Zero Trust). Its free plan lets you allow only your own email address. GitHub Pages can't do that on a free account.

## Backups

Your data lives in one browser. If you clear browser data or change phones, it's gone, unless you have a backup.

- **Settings → Download backup** saves a `.json` file. Do it every week or two.
- **Settings → Restore from file** loads it on any device.

## Reminders, quotes and breathing

All of it is bundled in `content.js` and nothing is fetched while you use the app. Add your own items to the lists there.

- Every ayah and hadith has a `ref` so you can check it. Ayat use the Uthmani text with the Sahih International meaning. Hadith are exact excerpts, numbered as on sunnah.com. Sunan items carry a `grade`.
- Quotes are real and credited to a named person. Add yours with a `cat` of `discipline`, `craft`, `learning` or `training`.
- The "last third of the night" nudge is worked out on the device from the sun's position for Bishkek (`PLACE` in `content.js`), with Fajr at 18°. Change `PLACE` for another city.
- Breathing modes are in `BREATH_MODES`: each is a list of steps with a length in seconds.

## Changing the defaults

`data.js` holds the starting habits, routine, dhikr list, topic ideas and the training plan. Edit it to change what a fresh install starts with. Edits you make inside the app (Settings, Routine → Edit) are saved in the browser and take priority.
