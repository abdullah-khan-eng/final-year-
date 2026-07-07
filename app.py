from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify
from flask_mysqldb import MySQL
from flask_bcrypt import Bcrypt
from config import Config
from reportlab.platypus import SimpleDocTemplate, Paragraph
from reportlab.lib.styles import getSampleStyleSheet
from google import genai
from google.genai import types
from google.genai import errors as genai_errors
import os
import time
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
gemini_client = genai.Client(api_key=Config.GEMINI_API_KEY)


@app.route("/")
def home():
    cursor = mysql.connection.cursor()

    cursor.execute("SELECT COUNT(*) FROM courses")
    total_courses = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM users WHERE role='student'")
    total_students = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM users WHERE role='teacher'")
    total_teachers = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM lectures")
    total_lectures = cursor.fetchone()[0]

    cursor.close()

    return render_template(
        "index.html",
        total_courses=total_courses,
        total_students=total_students,
        total_teachers=total_teachers,
        total_lectures=total_lectures
    )


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

            if user[4] == "teacher":
                return redirect(url_for("teacher_dashboard"))

            return redirect(url_for("dashboard"))

        flash("Invalid Email or Password", "danger")

    return render_template("login.html")


@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("login"))


@app.route("/teacher_dashboard")
def teacher_dashboard():

    if "user_id" not in session:
        return redirect(url_for("login"))

    if session.get("role") != "teacher":
        return redirect(url_for("dashboard"))

    cursor = mysql.connection.cursor()

    cursor.execute("SELECT id FROM courses WHERE course_name=%s", (session["course"],))
    course = cursor.fetchone()

    lecture_stats = []
    total_students = 0

    if course:
        course_id = course[0]

        cursor.execute(
            "SELECT id, title, description, video_url FROM lectures WHERE course_id=%s",
            (course_id,)
        )
        lectures = cursor.fetchall()

        for lecture in lectures:
            cursor.execute(
                "SELECT COUNT(*) FROM lecture_progress WHERE lecture_id=%s",
                (lecture[0],)
            )
            student_count = cursor.fetchone()[0]

            lecture_stats.append({
                "title": lecture[1],
                "description": lecture[2],
                "video_url": lecture[3],
                "student_count": student_count
            })

        cursor.execute(
            "SELECT COUNT(*) FROM users WHERE role='student' AND course=%s",
            (session["course"],)
        )
        total_students = cursor.fetchone()[0]

    cursor.close()

    return render_template(
        "teacher_dashboard.html",
        lecture_stats=lecture_stats,
        total_students=total_students,
        total_lectures=len(lecture_stats)
    )


@app.route("/teacher/upload_lecture", methods=["POST"])
def upload_lecture():

    if "user_id" not in session or session.get("role") != "teacher":
        return redirect(url_for("login"))

    title = request.form["title"]
    description = request.form["description"]
    video_url = request.form["video_url"]

    cursor = mysql.connection.cursor()

    cursor.execute("SELECT id FROM courses WHERE course_name=%s", (session["course"],))
    course = cursor.fetchone()

    if not course:
        cursor.close()
        return "Your course was not found. Please contact admin."

    cursor.execute(
        """
        INSERT INTO lectures (course_id, title, description, video_url)
        VALUES (%s, %s, %s, %s)
        """,
        (course[0], title, description, video_url)
    )

    mysql.connection.commit()
    cursor.close()

    flash("Lecture uploaded successfully!", "success")
    return redirect(url_for("teacher_dashboard"))


@app.route("/dashboard")
def dashboard():
    tab = request.args.get("tab", "overview")

    if "user_id" not in session:
        return redirect(url_for("login"))

    if session.get("role") == "teacher":
        return redirect(url_for("teacher_dashboard"))

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

    # Per-Lecture Progress (for "progress" tab)
    course_lectures = []

    if my_course:
        cursor.execute(
            "SELECT id, title FROM lectures WHERE course_id=%s",
            (my_course[0],)
        )
        lectures_in_course = cursor.fetchall()

        for lecture in lectures_in_course:
            cursor.execute(
                """
                SELECT completed, watched_percentage
                FROM lecture_progress
                WHERE student_id=%s AND lecture_id=%s
                """,
                (session["user_id"], lecture[0])
            )
            lecture_progress_row = cursor.fetchone()

            course_lectures.append({
                "title": lecture[1],
                "completed": lecture_progress_row[0] if lecture_progress_row else 0,
                "watched_percentage": lecture_progress_row[1] if lecture_progress_row else 0
            })

    # Certificates List (for "certificates" tab)
    cursor.execute(
        """
        SELECT co.course_name, c.certificate_file
        FROM certificates c
        JOIN courses co ON c.course_id = co.id
        WHERE c.student_id=%s
        """,
        (session["user_id"],)
    )
    certificate_list = cursor.fetchall()

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
        course_lectures=course_lectures,
        certificate_list=certificate_list,
        tab=tab
    )


@app.route("/chatbot")
def chatbot():

    if "user_id" not in session:
        return redirect(url_for("login"))

    cursor = mysql.connection.cursor()
    cursor.execute(
        """
        SELECT id, title FROM chat_conversations
        WHERE student_id=%s
        ORDER BY created_at DESC
        """,
        (session["user_id"],)
    )
    conversations = cursor.fetchall()
    cursor.close()

    return render_template("chatbot.html", conversations=conversations)


@app.route("/chatbot/new", methods=["POST"])
def chatbot_new():

    if "user_id" not in session:
        return jsonify({"error": "Not logged in"}), 401

    cursor = mysql.connection.cursor()
    cursor.execute(
        "INSERT INTO chat_conversations (student_id, title) VALUES (%s, %s)",
        (session["user_id"], "New Chat")
    )
    mysql.connection.commit()
    conversation_id = cursor.lastrowid
    cursor.close()

    return jsonify({"conversation_id": conversation_id, "title": "New Chat"})


@app.route("/chatbot/conversation/<int:conversation_id>/messages")
def chatbot_conversation_messages(conversation_id):

    if "user_id" not in session:
        return jsonify({"error": "Not logged in"}), 401

    cursor = mysql.connection.cursor()

    # Make sure this conversation belongs to the logged-in student
    cursor.execute(
        "SELECT id FROM chat_conversations WHERE id=%s AND student_id=%s",
        (conversation_id, session["user_id"])
    )
    if not cursor.fetchone():
        cursor.close()
        return jsonify({"error": "Conversation not found"}), 404

    cursor.execute(
        """
        SELECT role, content FROM chat_messages
        WHERE conversation_id=%s
        ORDER BY created_at ASC, id ASC
        """,
        (conversation_id,)
    )
    messages = [{"role": row[0], "content": row[1]} for row in cursor.fetchall()]
    cursor.close()

    return jsonify({"messages": messages})


@app.route("/chatbot/ask", methods=["POST"])
def chatbot_ask():

    if "user_id" not in session:
        return jsonify({"error": "Not logged in"}), 401

    data = request.get_json(silent=True) or {}
    question = data.get("question", "").strip()
    conversation_id = data.get("conversation_id")

    if not question:
        return jsonify({"error": "Question is required"}), 400

    cursor = mysql.connection.cursor()

    # Verify (or create) the conversation for this student
    conversation = None
    if conversation_id:
        cursor.execute(
            "SELECT id, title FROM chat_conversations WHERE id=%s AND student_id=%s",
            (conversation_id, session["user_id"])
        )
        conversation = cursor.fetchone()

    if not conversation:
        cursor.execute(
            "INSERT INTO chat_conversations (student_id, title) VALUES (%s, %s)",
            (session["user_id"], "New Chat")
        )
        mysql.connection.commit()
        conversation_id = cursor.lastrowid
        conversation_title = "New Chat"
    else:
        conversation_id = conversation[0]
        conversation_title = conversation[1]

    # Save the student's message
    cursor.execute(
        "INSERT INTO chat_messages (conversation_id, role, content) VALUES (%s, 'user', %s)",
        (conversation_id, question)
    )
    mysql.connection.commit()

    # Auto-title the conversation from the first message
    if conversation_title == "New Chat":
        new_title = question[:50] + ("..." if len(question) > 50 else "")
        cursor.execute(
            "UPDATE chat_conversations SET title=%s WHERE id=%s",
            (new_title, conversation_id)
        )
        mysql.connection.commit()
        conversation_title = new_title

    course = session.get("course", "your course")

    answer = None

    for attempt in range(3):
        try:
            response = gemini_client.models.generate_content(
                model=Config.GEMINI_MODEL,
                contents=question,
                config=types.GenerateContentConfig(
                    system_instruction=(
                        f"You are an AI tutor helping a student enrolled in the course "
                        f"'{course}'. Answer the student's question in detail, tailored "
                        f"to this course, in clear and simple language."
                    )
                )
            )
            answer = response.text
            break
        except genai_errors.ServerError:
            time.sleep(1.5 * (attempt + 1))
        except Exception:
            break

    if answer is None:
        cursor.close()
        return jsonify({
            "error": "The AI service is busy right now. Please try again in a moment."
        }), 503

    # Save the AI's response
    cursor.execute(
        "INSERT INTO chat_messages (conversation_id, role, content) VALUES (%s, 'bot', %s)",
        (conversation_id, answer)
    )
    mysql.connection.commit()
    cursor.close()

    return jsonify({
        "answer": answer,
        "conversation_id": conversation_id,
        "conversation_title": conversation_title
    })


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
    certificate_file = None

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
                SELECT certificate_file
                FROM certificates
                WHERE student_id=%s
                AND course_id=%s
            """, (
                session["user_id"],
                course_id
            ))

            already = cursor.fetchone()

            if already:
                certificate_file = already[0]
            else:

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

                certificate_file = pdf_file

    mysql.connection.commit()
    cursor.close()

    certificate_url = None
    if certificate_file:
        certificate_url = url_for("static", filename=certificate_file.split("static/")[1])

    return render_template(
        "quiz_result.html",
        marks=marks,
        total_questions=total_questions,
        percentage=percentage,
        passed=percentage >= 70,
        certificate_url=certificate_url
    )

if __name__ == "__main__":
    app.run(debug=True)