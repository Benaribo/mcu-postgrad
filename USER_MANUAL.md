McU Postgrad Track - User Manual

Version 1.0 Date: February 2026

Developed for: McPherson University, College of Computing

1. Introduction

The McU Postgrad Track application is a comprehensive web-based management system designed to streamline the administration of postgraduate student progress. It allows the PG Coordinator and administrative staff to track presentations (Seminar, Defense), manage schedules, and generate official reports for PGD, MSc, MPhil, and PhD programs.

2. Getting Started

Accessing the Application

Since this is a web application hosted online, you can access it from any modern web browser (Chrome, Edge, Firefox, Safari) using the provided URL. No installation is required.

Data Storage Note

The application uses Local Browser Storage. This means your data is saved automatically on the specific computer and browser you are using.

Important: If you clear your browser cache or switch computers, you will not see your data unless you use the Backup & Restore feature (see Section 8).

3. Dashboard Overview

The Dashboard is the first screen you see. It provides a visual command center for the entire program.

Key Metrics: View total Active Students, PhD Candidates, and Upcoming Events at a glance.

Supervisor Filter: Use the dropdown at the top right to filter the entire dashboard by a specific supervisor. This updates all charts and lists instantly.

Visual Analytics:

Program Distribution: A donut chart showing the split between PhD, MSc, etc.

Academic Pipeline: A bar chart showing how many students have completed each stage (Proposal, Pre-Data, etc.).

4. Managing Students

Adding a New Student

Navigate to the Students tab in the sidebar.

Click the + Add Student button at the top right.

Fill in the form:

Full Name & Reg Number.

Program: Select PGD, MSc, MPhil, or PhD. The system automatically assigns the correct presentation stages based on this choice.

Email: Required for sending notifications.

Supervisor: Required.

Co-Supervisor: Optional.

Joined Date: Used to track the duration of their study.

Click Save Student.

Editing or Deleting

Edit: Click the "Edit" button on any student card to update their details.

Delete: Click the Trash Icon (Red) to remove a student permanently. Warning: This action cannot be undone.

Duration Tracking

A small orange badge (e.g., 2.5 yrs) appears on every student card. This calculates the time elapsed since their "Joined Date", helping you identify students who are overstaying their program duration.

5. Scheduling & Tracking Presentations

The core of the app is the Presentation Track. Depending on the program, students have different stages (e.g., PhD has 4 stages: Proposal, Pre-Data, Post-Data, Viva).

Scheduling a Presentation

Find the student in the list.

Click on the specific Stage Box (e.g., "Proposal Defense").

Set the Status to "Scheduled".

Enter the Date, Time, and Venue.

(Optional) Paste a Google Drive/Dropbox Link to their document.

Click Book Schedule.

Managing a Completed Presentation

Click the Stage Box.

Change Status to "Completed".

Enter the Score / Grade and Remarks.

Click Update Record. The stage will turn green with a checkmark.

Notifications & Calendar

When a presentation is marked as "Scheduled":

Add to Calendar: Click to open Google Calendar with the event pre-filled.

Notify Supervisor: Opens your email client with a pre-written email to the supervisors.

Notify Student: Opens your email client with a pre-written email to the student.

6. Graduation & Alumni

Graduating a Student

Once a student completes their final stage (e.g., Viva Voce):

Open the final stage card.

Ensure status is Completed.

A green "Graduate Student" button will appear at the bottom.

Click it to move the student to the Alumni Archive.

Promoting Alumni (e.g., MSc to PhD)

Go to the Alumni / History tab.

Find the graduated student.

Click "Start New Program".

This opens the "Add Student" form pre-filled with their bio-data so you can enroll them in a higher degree immediately.

7. Reports

General Summary Report

Go to the Reports tab.

This shows a summary table of all active students.

Export Excel (CSV): Downloads a spreadsheet compatible with Excel.

Print / Save PDF: Opens the print dialog. Use "Save as PDF" to generate a file for the college.

Individual Student Transcript

Go to the Students tab.

Click the Printer Icon on a specific student's card.

This opens an official "Individual Student Progress Report".

It includes their Bio-data, Program details (Computer Science), and a full history of their presentations with scores and remarks.

Click "Print Official Report" to print or save as PDF.

8. Backup & Restore (CRITICAL)

Since data is stored in your browser, you MUST backup regularly to prevent data loss.

How to Backup

Go to the Settings tab.

Click "Download Backup".

This saves a .json file to your computer (e.g., mcu_postgrad_backup_2026-02-04.json).

Recommendation: Do this at the end of every week or after major updates. Save the file to a secure folder or cloud drive (Google Drive/OneDrive).

How to Restore

If you change computers or lose data, go to Settings.

Click "Restore from File".

Select your last backup .json file.

Confirm the action. Your database will be restored.

Bulk Import

You can import students from Excel:

Go to Settings.

Click "Download Template" to get the correct CSV format.

Fill in your data (do not change the header row).

Click "Import Students" and select your filled CSV file.

9. Troubleshooting

Issue

Possible Cause

Solution

I don't see my data anymore.

Browser cache cleared or different browser used.

Use "Restore from File" in Settings to load your last backup.

"Notify Student" button does nothing.

No email address in student record.

Edit the student and add a valid email address.

Report page is blank.

Browser print settings issue.

Refresh the page. Ensure you are using a modern browser like Chrome or Edge.

Duplicate Supervisor names in Filter.

Extra spaces in names (e.g., "Dr Smith " vs "Dr Smith").

The system now auto-trims names. Edit student records to ensure consistent spelling.

Support Contact: For technical issues or feature requests, please contact the developer.