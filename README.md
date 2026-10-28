# The To-Dread List

A playful, spooky tracker and recommender for horror novels. It runs entirely in the browser, so it works on GitHub Pages with no build step.

- **The Spooky Stacks**: 147 horror novels from four collections. Search, filter by collection or theme, sort, mark what you've read and rate it from 1 to 5 pumpkins.
  - **Spooky Hundred**: the 100 top-ranked novels on Goodreads' [Best Horror Novels](https://www.goodreads.com/list/show/135.Best_Horror_Novels) list (readers' favorites).
  - **Award winners**: Bram Stoker Award winners for best novel and best first novel, Shirley Jackson Award winners for best novel, and Goodreads Choice Award horror winners.
  - **Classic canon**: landmark gothic and early horror novels often cited in critical histories of the genre.
  Books in more than one collection carry a badge for each.
- **The Crystal Ball**: recommends 3 novels you haven't read yet, based on your ratings, and says why it picked each one. Picks come from unread books in the list and a pool of about 40 "deeper cuts" beyond it. Wave one away with "Not for me" and another takes its place.
- **Your Stash**: your progress is saved in this browser (`localStorage`). Export it to a JSON file, or import one on another device.

## How recommendations work

Every book is tagged with themes (haunted house, cosmic, folk horror, serial killer, gothic, and so on). Your ratings build a taste profile: 4–5 pumpkins pull it toward a book's themes, 1–2 pumpkins push it away, and read-but-unrated books count a little. Rare themes count for more than common ones. Unread books are ranked by how closely they match your profile, with a small boost for authors you rated highly and for award winners and classics, and each pick comes from a different author. The code is in `js/recommender.js`.

## Publishing on GitHub Pages

1. Merge this branch into your default branch (or publish straight from this branch).
2. In the repository, open **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to *Deploy from a branch*, pick the branch, and choose the `/ (root)` folder.
4. Save. The site goes live at `https://<your-username>.github.io/horrorlittracker/` within a minute or two.

To run it locally, serve the folder with any static server, for example `python3 -m http.server`, and open http://localhost:8000.

## Files

| Path | What it is |
| --- | --- |
| `index.html` | Page structure |
| `css/style.css` | Funny-spooky theme |
| `js/books.js` | Every book, its theme tags, and its collections and awards |
| `js/recommender.js` | Taste profile and recommendation scoring |
| `js/app.js` | Tracking, filtering, saving, and rendering |

## Notes

- The lists were compiled from memory, not fetched live, so ranks, award years, and a few entries may be off. Award lists cover the years I was confident about and skip the rest. Goodreads' list is also voted on continually, so its order shifts over time. Edit `js/books.js` to correct or extend anything.
