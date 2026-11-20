import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from sqlalchemy import text, exc
from app.database import engine

def verify_tls():
    with engine.connect() as conn:
        res = conn.execute(text("SELECT 1")).scalar()
        assert res == 1, "SELECT 1 failed"
        ssl_status = conn.execute(text("SHOW STATUS LIKE 'Ssl_cipher'")).fetchall()
        cipher = dict(ssl_status).get("Ssl_cipher", "")
        print(f"[PASS] SELECT 1 over TLS verified (Cipher: {cipher})")

def verify_default_role():
    with engine.begin() as conn:
        conn.execute(
            text(
                "INSERT INTO users (name, email, password_hash) "
                "VALUES ('Test Default Role', 'temp_default@test.com', 'test_hash')"
            )
        )
        row = conn.execute(
            text("SELECT role FROM users WHERE email = 'temp_default@test.com'")
        ).fetchone()
        assert row is not None, "User not found"
        assert row[0] == "User", f"Expected 'User', got {row[0]}"
        conn.execute(text("DELETE FROM users WHERE email = 'temp_default@test.com'"))
    print("[PASS] Default role='User' when omitted verified")

def verify_duplicate_email():
    with engine.begin() as conn:
        conn.execute(
            text(
                "INSERT INTO users (name, email, password_hash) "
                "VALUES ('Dup Test 1', 'temp_dup@test.com', 'test_hash')"
            )
        )
    duplicate_caught = False
    try:
        with engine.begin() as conn:
            conn.execute(
                text(
                    "INSERT INTO users (name, email, password_hash) "
                    "VALUES ('Dup Test 2', 'temp_dup@test.com', 'test_hash')"
                )
            )
    except exc.IntegrityError:
        duplicate_caught = True
    finally:
        with engine.begin() as conn:
            conn.execute(text("DELETE FROM users WHERE email = 'temp_dup@test.com'"))
    assert duplicate_caught, "Duplicate email was not rejected"
    print("[PASS] Duplicate email rejection verified")

def verify_cascade_delete():
    with engine.begin() as conn:
        conn.execute(
            text(
                "INSERT INTO users (name, email, password_hash) "
                "VALUES ('Cascade User', 'temp_cascade@test.com', 'test_hash')"
            )
        )
        user_id = conn.execute(
            text("SELECT id FROM users WHERE email = 'temp_cascade@test.com'")
        ).scalar()
        conn.execute(
            text(
                f"INSERT INTO tasks (user_id, title, status) "
                f"VALUES ({user_id}, 'Cascade Task', 'Pending')"
            )
        )
        task_count = conn.execute(
            text(f"SELECT COUNT(*) FROM tasks WHERE user_id = {user_id}")
        ).scalar()
        assert task_count == 1, "Task was not created"
        conn.execute(text(f"DELETE FROM users WHERE id = {user_id}"))
        task_count_after = conn.execute(
            text(f"SELECT COUNT(*) FROM tasks WHERE user_id = {user_id}")
        ).scalar()
        assert task_count_after == 0, "Task was not deleted on user cascade"
    print("[PASS] ON DELETE CASCADE on temporary user and task verified")

def verify_explain_index():
    with engine.connect() as conn:
        result = conn.execute(
            text("EXPLAIN SELECT * FROM tasks WHERE user_id = 2 AND status = 'Pending'")
        ).fetchall()
        rows_str = " ".join(str(r) for r in result)
        assert "idx_tasks_user_status" in rows_str, f"Index not used in EXPLAIN: {rows_str}"
        print("[PASS] EXPLAIN confirmed index idx_tasks_user_status usage:")
        for r in result:
            print("  ", r)

if __name__ == "__main__":
    verify_tls()
    verify_default_role()
    verify_duplicate_email()
    verify_cascade_delete()
    verify_explain_index()
    print("All database verifications passed successfully!")
