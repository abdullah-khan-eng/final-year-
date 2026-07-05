# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"AI Learning Assistant" — a final-year student project: a Flask + MySQL e-learning platform with course lectures, quizzes, a progress dashboard, and PDF certificate generation. It began life as a static HTML/CSS/JS marketing template and is partway through being wired into Flask; see "Two generations of templates" below before touching frontend files.

## Setup & Running

There is no `requirements.txt`, no virtualenv checked in, and the dependencies are **not currently installed** in this environment. Install manually before running:

```
pip install flask flask-mysqldb flask-bcrypt reportlab
```

`flask-mysqldb` requires a working `MySQLdb`/`mysqlclient` build, which needs MySQL client libraries present on the system — this is the most likely install failure point on Windows.

Database: a local MySQL server must be running with a database matching `config.py` (`ai_learning_assistant`, host `localhost`, user `root`, empty password). **There is no schema/migration file in this repo** — the schema must be created by hand from the table/column usage in `app.py` (see Database schema below).

Run the app:
```
python app.py
```
Starts the Flask dev server with `debug=True` (default port 5000).

There are no tests, no linter config, and no build step in this repo currently.

## Architecture

### Backend is a single file (`app.py`)

All routes, session handling, and business logic live directly in `app.py` — no blueprints, no models module, no DB access layer. Raw SQL is executed via `flask_mysqldb` cursors inline in each view function; rows are accessed by tuple index (e.g. `user[1]`, `q[7]`), not by column name, since there's no ORM.

Routes:
- `/` — home page
- `/register`, `/login` — bcrypt-hashed passwords; login stores `session["user_id"|"name"|"email"|"role"|"course"]`, which nearly every other route depends on
- `/dashboard` — tab switching via `?tab=` query param, all rendered server-side in one template
- `/lectures`, `/lecture/<id>`, `/complete_lecture/<id>` — lecture browsing/progress scoped to the logged-in student's `session["course"]`
- `/quiz`, `/submit_quiz` — quiz for the student's course pulled from the DB; on `submit_quiz`, if `percentage >= 70` and no certificate exists yet for that student+course, `generate_certificate()` (top of `app.py`, uses `reportlab`) writes a PDF to `static/certificates/`
- `/test_db` — connectivity smoke test

### Database schema (reconstructed — not documented anywhere else)

Since there's no schema file, this is inferred from queries in `app.py` and Jinja tuple-index access in the templates. Treat as the source of truth until an actual schema is added:

- `users(id, name, email, password, role, course)`
- `courses(id, course_name, ...)`
- `lectures(id, course_id, ...)`
- `lecture_progress(student_id, lecture_id, completed, watched_percentage, last_watched)`
- `quiz(id, course_id, title)`
- `quiz_questions(id, quiz_id, question, option_a, option_b, option_c, option_d, correct_answer)` — indices 0–7, matching `q[7]` as the correct-answer check in `submit_quiz`
- `quiz_results(student_id, quiz_id, marks, percentage, submitted_at)`
- `certificates(student_id, course_id, certificate_file)`

When changing quiz/dashboard/lecture logic, cross-check both `app.py`'s cursor queries and the template's `{{ q[n] }}` indexing — a column reorder in one breaks the other silently.

### Two generations of templates — know which is which before editing

- **Wired templates** (actually rendered by a Flask route; use `{{ url_for(...) }}` for static assets and internal links): `index.html`, `login.html`, `register.html`, `dashboard.html`, `lectures.html`, `lecture_player.html`, `quiz.html`.
- **Orphaned templates** (no Flask route renders them — leftovers from the original static site; use hardcoded relative paths like `../static/style.css` and bare `*.html` nav links that won't resolve correctly under Flask): `chatbot.html`, `courses.html`, `features.html`, `tech.html`, `footer.html`. Their matching JS files (`chatbot.js`, `courses.js`, `features.js`, `script.js`) are likewise unused by any wired page. `chatbot.html` also references a nonexistent `static/css/style.css` (there is no `static/css/` directory, only `static/style.css`).
- If asked to bring one of the orphaned pages online, you'll need to both add a Flask route for it and fix its asset paths to use `url_for`.
- `static/quiz.js` is a fully separate, hardcoded client-side quiz (fake "AI" answers, its own question bank) left over from the static-site version — it is **not** used by the real, DB-driven quiz flow (`quiz.html` + `/quiz` + `/submit_quiz` in `app.py`). Don't conflate the two when asked to change "the quiz."
