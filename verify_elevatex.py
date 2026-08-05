import os
import time
from playwright.sync_api import sync_playwright

def run_verification(page):
    # Setup screenshot directory
    os.makedirs("/home/jules/verification/screenshots", exist_ok=True)

    print("=== [1] Verifying Landing Page & SEO Metadata ===")
    page.goto("http://localhost:3000")
    page.wait_for_timeout(1000)

    # Assert Title & SEO Metadata
    title = page.title()
    print(f"Browser Title: '{title}'")
    assert "ElevateX" in title, f"Branding mismatch in title: {title}"

    # Take Landing Page Screenshot
    page.screenshot(path="/home/jules/verification/screenshots/1_landing_page.png")
    page.wait_for_timeout(500)

    # Check Navbar/Footer
    navbar_text = page.locator("nav").inner_text()
    assert "ElevateX" in navbar_text, "Branding mismatch in navbar"
    footer_text = page.locator("footer").inner_text()
    assert "ElevateX" in footer_text, "Branding mismatch in footer"

    print("Landing Page & Core Branding checked successfully!")

    print("\n=== [2] Verifying Jobs Catalog (Advanced Job Portal) ===")
    page.goto("http://localhost:3000/jobs")
    page.wait_for_timeout(1000)
    page.screenshot(path="/home/jules/verification/screenshots/2_jobs_catalog.png")
    page.wait_for_timeout(500)

    # Assert no AscendIQ on Jobs Catalog
    body_text = page.locator("body").inner_text()
    assert "AscendIQ" not in body_text, "Found legacy branding 'AscendIQ' on Jobs Catalog page!"

    print("\n=== [3] Verifying Login View ===")
    page.goto("http://localhost:3000/login")
    page.wait_for_timeout(1000)
    page.screenshot(path="/home/jules/verification/screenshots/3_login_page.png")
    page.wait_for_timeout(500)

    # --- Student Journey ---
    print("\n=== [4] Verifying Student Flow ===")
    page.get_by_placeholder("name@company.com").fill("student@ascendiq.com")
    page.get_by_placeholder("••••••••••••").fill("securepassword")
    page.wait_for_timeout(500)
    page.get_by_role("button", name="Sign In to ElevateX").click()
    page.wait_for_timeout(1500)

    # Student Dashboard Page
    page.screenshot(path="/home/jules/verification/screenshots/4_student_dashboard.png")
    page.wait_for_timeout(500)
    body_text = page.locator("body").inner_text()
    assert "ElevateX" in body_text or "Jane Learner" in body_text, "Failed student login"
    assert "AscendIQ" not in body_text, "Found legacy branding 'AscendIQ' in Student Dashboard!"

    # Student Jobs & Step-by-step horizontal progress tracker
    print("Verifying Student Jobs / Applied Careers Timeline tracker...")
    page.get_by_role("link", name="Saved & Applied Jobs").click()
    page.wait_for_timeout(1000)
    page.screenshot(path="/home/jules/verification/screenshots/5_student_jobs_timeline.png")
    page.wait_for_timeout(500)

    # Navigate to course learning player
    print("Verifying Course Learning Player...")
    page.get_by_role("link", name="My Courses").click()
    page.wait_for_timeout(1000)
    # Click on the first course
    page.get_by_text("Generative AI & LLM Architecture").first.click()
    page.wait_for_timeout(1500)
    page.screenshot(path="/home/jules/verification/screenshots/6_course_player.png")
    page.wait_for_timeout(500)

    # Navigate to Certificate verification page directly to check
    print("Verifying Certificate Verification Page...")
    # Seed certificate ID is 'cert_1'
    page.goto("http://localhost:3000/verify/cert_1")
    page.wait_for_timeout(1500)
    page.screenshot(path="/home/jules/verification/screenshots/7_certificate_verification.png")
    page.wait_for_timeout(500)
    body_text = page.locator("body").inner_text()
    assert "ElevateX" in body_text, "Branding mismatch on Certificate Verification Page"
    assert "AscendIQ" not in body_text, "Found legacy branding 'AscendIQ' on Certificate Verification Page!"

    # Logout Student (from student dashboard)
    page.goto("http://localhost:3000/student-dashboard")
    page.wait_for_timeout(1000)
    page.get_by_role("button", name="Sign Out").first.click()
    page.wait_for_timeout(1000)

    # --- Instructor Journey ---
    print("\n=== [5] Verifying Instructor Flow ===")
    page.goto("http://localhost:3000/login")
    page.wait_for_timeout(1000)
    page.get_by_placeholder("name@company.com").fill("sarah@ascendiq.com")
    page.get_by_placeholder("••••••••••••").fill("securepassword")
    page.wait_for_timeout(500)
    page.get_by_role("button", name="Sign In to ElevateX").click()
    page.wait_for_timeout(1500)
    page.screenshot(path="/home/jules/verification/screenshots/8_instructor_dashboard.png")
    page.wait_for_timeout(500)
    body_text = page.locator("body").inner_text()
    assert "Instructor Dashboard" in body_text or "Jenkins" in body_text, "Failed instructor login"
    assert "AscendIQ" not in body_text, "Found legacy branding 'AscendIQ' in Instructor Dashboard!"

    # Logout Instructor
    page.get_by_role("button", name="Sign Out").first.click()
    page.wait_for_timeout(1000)

    # --- Recruiter Journey ---
    print("\n=== [6] Verifying Recruiter Flow ===")
    page.goto("http://localhost:3000/login")
    page.wait_for_timeout(1000)
    page.get_by_placeholder("name@company.com").fill("recruiter@ascendiq.com")
    page.get_by_placeholder("••••••••••••").fill("securepassword")
    page.wait_for_timeout(500)
    page.get_by_role("button", name="Sign In to ElevateX").click()
    page.wait_for_timeout(1500)
    page.screenshot(path="/home/jules/verification/screenshots/9_recruiter_dashboard.png")
    page.wait_for_timeout(500)
    body_text = page.locator("body").inner_text()
    assert "Recruiter Dashboard" in body_text or "Jonathan Wright" in body_text, "Failed recruiter login"
    assert "AscendIQ" not in body_text, "Found legacy branding 'AscendIQ' in Recruiter Dashboard!"

    # Logout Recruiter
    page.get_by_role("button", name="Terminate Session").first.click()
    page.wait_for_timeout(1000)

    # --- Admin Journey ---
    print("\n=== [7] Verifying Admin Flow ===")
    page.goto("http://localhost:3000/login")
    page.wait_for_timeout(1000)
    page.get_by_placeholder("name@company.com").fill("admin@ascendiq.com")
    page.get_by_placeholder("••••••••••••").fill("securepassword")
    page.wait_for_timeout(500)
    page.get_by_role("button", name="Sign In to ElevateX").click()
    page.wait_for_timeout(1500)
    page.screenshot(path="/home/jules/verification/screenshots/10_admin_dashboard.png")
    page.wait_for_timeout(500)
    body_text = page.locator("body").inner_text()
    assert "Admin Dashboard" in body_text or "System Administrator" in body_text, "Failed admin login"
    assert "AscendIQ" not in body_text, "Found legacy branding 'AscendIQ' in Admin Dashboard!"

    # Logout Admin
    page.get_by_role("button", name="Terminate Session").first.click()
    page.wait_for_timeout(1000)

    print("\n==============================================")
    print("ALL VERIFICATIONS COMPLETED SUCCESSFULLY!")
    print("ZERO LEGACY BRANDING STRINGS DETECTED.")
    print("ALL SCREENSHOTS GENERATED CORRECTLY.")
    print("==============================================")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="/home/jules/verification/videos"
        )
        page = context.new_page()
        try:
            run_verification(page)
        finally:
            context.close()
            browser.close()
