from flask import Flask, render_template, request, redirect, url_for, flash, session
from flask import Flask, render_template, request, redirect, url_for, flash
from flask_mysqldb import MySQL
from flask_bcrypt import Bcrypt
from config import Config
from reportlab.platypus import SimpleDocTemplate, Paragraph
from reportlab.lib.styles import getSampleStyleSheet
import os
def generate_certificate(student_name, course_name, percentage, filename):

    os.makedirs("static/certificates", exist_ok=True)

    pdf = SimpleDocTemplate(filename)

    styles = getSampleStyleSheet()

    story = []

    story.append(Paragraph("<b><font size=24>AI Learning Assistant</font></b>", styles["Title"]))
    story.append(Paragraph("<br/><br/>", styles["Normal"]))

    story.append(Paragraph("<b><font size=20>Certificate of Completion</font></b>", styles["Heading1"]))
    story.append(Paragraph("<br/><br/>", styles["Normal"]))

    story.append(
        Paragraph(
            f"This is to certify that <b>{student_name}</b> has successfully completed the course <b>{course_name}</b>.",
            styles["BodyText"]
        )
    )

    story.append(Paragraph("<br/>", styles["Normal"]))

    story.append(
        Paragraph(
            f"<b>Final Score:</b> {percentage}%",
            styles["BodyText"]
        )
    )

    story.append(Paragraph("<br/>", styles["Normal"]))

    story.append(
        Paragraph(
            "Congratulations on successfully completing your course!",
            styles["BodyText"]
        )
    )

    pdf.build(story)
# os.makedirs("static/certificates", exist_ok=True)

app = Flask(__name__)
app.config.from_object(Config)

mysql = MySQL(app)
bcrypt = Bcrypt(app)


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/test_db")
def test_db():
    try:
        cursor = mysql.connection.cursor()
        cursor.execute("SELECT DATABASE();")
        data = cursor.fetchone()
        cursor.close()

        return f"Connected Successfully: {data[0]}"

    except Exception as e:
        return str(e)


@app.route("/register", methods=["GET", "POST"])
def register():

    if request.method == "POST":

        name = request.form["name"]
        email = request.form["email"]
        role = request.form["role"]
        course = request.form["course"]
        password = request.form["password"]
        confirm = request.form["confirm_password"]

        if password != confirm:
            flash("Passwords do not match.", "danger")
            return redirect(url_for("register"))

        cursor = mysql.connection.cursor()

        cursor.execute(
            "SELECT * FROM users WHERE email=%s",
            (email,)
        )

        user = cursor.fetchone()

        if user:
            flash("Email already exists.", "warning")
            cursor.close()
            return redirect(url_for("register"))

        hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")

        cursor.execute(
            """
            INSERT INTO users (name, email, password, role, course)
            VALUES (%s, %s, %s, %s, %s)
            """,
            (name, email, hashed_password, role, course)
        )

        mysql.connection.commit()
        cursor.close()

        flash("Registration Successful!", "success")

        return redirect(url_for("login"))

    return render_template("register.html")


# @app.route("/login")
# def login():
#     return "Login Page Coming Soon"


@app.route("/login", methods=["GET", "POST"])
def login():

    if request.method == "POST":

        email = request.form["email"]
        password = request.form["password"]

        cursor = mysql.connection.cursor()

        cursor.execute(
            "SELECT * FROM users WHERE email=%s",
            (email,)
        )

        user = cursor.fetchone()

        cursor.close()

        if user and bcrypt.check_password_hash(user[3], password):

            session["user_id"] = user[0]
            session["name"] = user[1]
            session["email"] = user[2]
            session["role"] = user[4]
            session["course"] = user[5]

            return redirect(url_for("dashboard"))

        flash("Invalid Email or Password", "danger")

    return render_template("login.html")


@app.route("/dashboard")
def dashboard():
    tab = request.args.get("tab", "overview")

    if "user_id" not in session:
        return redirect(url_for("login"))

    cursor = mysql.connection.cursor()

    # Logged in User
    cursor.execute("SELECT * FROM users WHERE id=%s", (session["user_id"],))
    user = cursor.fetchone()

    # Total Courses
    cursor.execute("SELECT COUNT(*) FROM courses")
    total_courses = cursor.fetchone()[0]

    # Total Lectures
    cursor.execute("SELECT COUNT(*) FROM lectures")
    total_lectures = cursor.fetchone()[0]

    # Student Selected Course
    cursor.execute(
        "SELECT * FROM courses WHERE course_name=%s",
        (session["course"],)
    )
    my_course = cursor.fetchone()

    # Certificates
    cursor.execute(
        "SELECT COUNT(*) FROM certificates WHERE student_id=%s",
        (session["user_id"],)
    )
    certificates = cursor.fetchone()[0]

    # Latest Quiz Result
    cursor.execute("""
        SELECT marks, percentage
        FROM quiz_results
        WHERE student_id=%s
        ORDER BY submitted_at DESC
        LIMIT 1
    """, (session["user_id"],))

    quiz_result = cursor.fetchone()

    # Completed Lectures
    cursor.execute(
        """
        SELECT COUNT(*)
        FROM lecture_progress
        WHERE student_id=%s
        AND completed=1
        """,
        (session["user_id"],)
    )

    completed_lectures = cursor.fetchone()[0]

    # Progress Calculation
    progress = 0

    if total_lectures > 0:
        progress = int((completed_lectures / total_lectures) * 100)

    cursor.close()

    return render_template(
        "dashboard.html",
        user=user,
        total_courses=total_courses,
        total_lectures=total_lectures,
        progress=progress,
        certificates=certificates,
        my_course=my_course,
        quiz_result=quiz_result,
        tab=tab
    )
@app.route("/lectures")
def lectures():

    if "user_id" not in session:
        return redirect(url_for("login"))

    cursor = mysql.connection.cursor()

    # Student ka selected course
    cursor.execute(
        "SELECT id FROM courses WHERE course_name=%s",
        (session["course"],)
    )

    course = cursor.fetchone()

    # Agar course na mile
    if not course:
        cursor.close()
        return "Course not found."

    course_id = course[0]

    # Us course ki lectures
    cursor.execute(
        "SELECT * FROM lectures WHERE course_id=%s",
        (course_id,)
    )

    lectures = cursor.fetchall()

    cursor.close()

    return render_template(
        "lectures.html",
        lectures=lectures
    )
@app.route("/lecture/<int:lecture_id>")
def lecture_player(lecture_id):

    if "user_id" not in session:
        return redirect(url_for("login"))

    cursor = mysql.connection.cursor()

    cursor.execute(
        "SELECT * FROM lectures WHERE id=%s",
        (lecture_id,)
    )

    lecture = cursor.fetchone()

    cursor.close()

    return render_template(
        "lecture_player.html",
        lecture=lecture
    )


@app.route("/complete_lecture/<int:lecture_id>")
def complete_lecture(lecture_id):

    if "user_id" not in session:
        return redirect(url_for("login"))

    cursor = mysql.connection.cursor()

    # Check agar record pehle se hai
    cursor.execute(
        """
        SELECT * FROM lecture_progress
        WHERE student_id=%s AND lecture_id=%s
        """,
        (session["user_id"], lecture_id)
    )

    record = cursor.fetchone()

    if record:
        # Update existing record
        cursor.execute(
            """
            UPDATE lecture_progress
            SET completed=1,
                watched_percentage=100,
                last_watched=NOW()
            WHERE student_id=%s AND lecture_id=%s
            """,
            (session["user_id"], lecture_id)
        )
    else:
        # Insert new record
        cursor.execute(
            """
            INSERT INTO lecture_progress
            (student_id, lecture_id, completed, watched_percentage)
            VALUES (%s, %s, 1, 100)
            """,
            (session["user_id"], lecture_id)
        )

    mysql.connection.commit()
    cursor.close()

    return redirect(url_for("lectures"))  

@app.route("/quiz")
def quiz():

    if "user_id" not in session:
        return redirect(url_for("login"))

    cursor = mysql.connection.cursor()

    # Student ke course ka quiz
    cursor.execute("""
        SELECT q.id,q.title
        FROM quiz q
        JOIN courses c ON q.course_id=c.id
        WHERE c.course_name=%s
    """, (session["course"],))

    quiz = cursor.fetchone()

    if not quiz:
        cursor.close()
        return "Quiz not found"

    quiz_id = quiz[0]

    # Quiz ke questions
    cursor.execute("""
        SELECT *
        FROM quiz_questions
        WHERE quiz_id=%s
    """, (quiz_id,))

    questions = cursor.fetchall()

    cursor.close()

    return render_template(
        "quiz.html",
        questions=questions,
        quiz_title=quiz[1]
    )
    
@app.route("/submit_quiz", methods=["POST"])
def submit_quiz():

    if "user_id" not in session:
        return redirect(url_for("login"))

    cursor = mysql.connection.cursor()

    # Student ke course ka quiz
    cursor.execute("""
        SELECT q.id
        FROM quiz q
        JOIN courses c ON q.course_id = c.id
        WHERE c.course_name=%s
    """, (session["course"],))

    quiz = cursor.fetchone()

    if not quiz:
        cursor.close()
        return "Quiz not found"

    quiz_id = quiz[0]

    # Quiz Questions
    cursor.execute("""
        SELECT *
        FROM quiz_questions
        WHERE quiz_id=%s
    """, (quiz_id,))

    questions = cursor.fetchall()

    total_questions = len(questions)
    marks = 0

    for q in questions:

        student_answer = request.form.get(f"question{q[0]}")

        if student_answer == q[7]:
            marks += 1

    percentage = 0

    if total_questions > 0:
        percentage = round((marks / total_questions) * 100)

    # Save Quiz Result
    cursor.execute("""
        INSERT INTO quiz_results
        (student_id, quiz_id, marks, percentage)
        VALUES (%s, %s, %s, %s)
    """, (
        session["user_id"],
        quiz_id,
        marks,
        percentage
    ))

    # Generate Certificate if Passed
    if percentage >= 70:

        # Course ID
        cursor.execute(
            "SELECT id FROM courses WHERE course_name=%s",
            (session["course"],)
        )

        course = cursor.fetchone()

        if course:

            course_id = course[0]

            # Check Existing Certificate
            cursor.execute("""
                SELECT *
                FROM certificates
                WHERE student_id=%s
                AND course_id=%s
            """, (
                session["user_id"],
                course_id
            ))

            already = cursor.fetchone()

            if not already:

                # PDF Path
                pdf_file = f"static/certificates/certificate_{session['user_id']}_{course_id}.pdf"

                # Generate PDF
                generate_certificate(
                    session["name"],
                    session["course"],
                    percentage,
                    pdf_file
                )

                # Save Certificate
                cursor.execute("""
                    INSERT INTO certificates
                    (student_id, course_id, certificate_file)
                    VALUES (%s, %s, %s)
                """, (
                    session["user_id"],
                    course_id,
                    pdf_file
                ))

    mysql.connection.commit()
    cursor.close()

    return f"""
        <h2>🎉 Quiz Submitted Successfully</h2>

        <h3>Marks: {marks}/{total_questions}</h3>

        <h3>Percentage: {percentage}%</h3>

        <br>

        <a href="/dashboard">⬅ Back to Dashboard</a>
    """

if __name__ == "__main__":
    app.run(debug=True)