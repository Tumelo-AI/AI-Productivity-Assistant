# CleanState AI

Build a complete, polished, responsive web application called CLEANSTATE AI — an AI-Powered Workplace Productivity Assistant.

This is a real-world AI productivity project designed to demonstrate AI automation, prompt engineering, responsible AI, and measurable workplace productivity improvements.

Do NOT build a generic chatbot. Build a functional productivity platform with multiple AI-powered workplace tools.

1. PRODUCT VISION

CleanState AI helps professionals save time by using AI to automate common workplace tasks.

The platform must provide four primary AI tools:

Smart Email Generator

Meeting Notes Summarizer

AI Task Planner

AI Research Assistant

Also include a central AI Assistant/chat interface.

The experience should feel like a modern SaaS productivity application similar in quality to professional workplace software.

2. TECHNOLOGY

Use:

React

TypeScript

Tailwind CSS

shadcn/ui components

Supabase for authentication and database

Supabase Edge Functions for secure AI/API calls

An LLM API integration for AI functionality

Lucide icons

Do not expose API keys in frontend code.

Store API credentials securely using environment variables/secrets.

Structure the application so the AI provider can be changed later without rewriting the frontend.

3. APPLICATION STRUCTURE

Create the following routes/pages:

Public Pages

/

Landing page

Include:

CleanState AI logo

Hero section

Short explanation of the platform

"Start Creating" CTA

Feature overview

Productivity benefits

Responsible AI statement

Footer

Hero headline:

Work Smarter. Get More Done with AI.

Supporting text:

Your AI-powered workplace assistant for emails, meetings, planning and research.

Primary CTA:

Get Started

Secondary CTA:

Explore Features

/login

Login page.

Include:

Email

Password

Login button

Sign-up link

Forgot password link

/signup

Registration page.

Include:

Full name

Email

Password

Confirm password

Create account button

Use Supabase Authentication.

4. AUTHENTICATED APPLICATION

After login, use a dashboard layout with:

Sidebar

Display:

Cleanstate AI logo

Dashboard

Email Generator

Meeting Summarizer

Task Planner

Research Assistant

AI Assistant

History

Settings

At the bottom:

User profile

Account settings

Logout

On mobile, replace the sidebar with a responsive navigation menu.

5. DASHBOARD

Route:

/dashboard

Create a professional dashboard.

Header

Display:

Good morning, [User Name]

Subtitle:

What would you like to accomplish today?

Quick Action Cards

Create four large cards:

Email Generator

"Create professional emails in seconds."

Button:

Create Email

Meeting Summarizer

"Turn lengthy meeting notes into clear action items."

Button:

Summarize Notes

Task Planner

"Organize priorities and build your ideal schedule."

Button:

Plan My Day

Research Assistant

"Understand complex information faster."

Button:

Start Research

Productivity Overview

Display simple statistics:

Emails generated

Meetings summarized

Tasks planned

Research sessions

These should come from the database.

Recent Activity

Show the user's recent AI activities.

Each activity should display:

Tool used

Short title

Date/time

Status

Open button

6. SMART EMAIL GENERATOR

Route:

/email-generator

Create a two-column workspace.

Left panel — Input

Fields:

Recipient

Text input.

Audience

Dropdown:

Client

Manager

Team

Colleague

Other

Purpose

Textarea.

Important Information

Textarea.

Tone

Dropdown:

Formal

Professional

Friendly

Persuasive

Concise

Length

Dropdown:

Short

Medium

Detailed

Button:

Generate Email

Secondary button:

Clear

Right panel — AI Output

Display:

Subject

Generated subject line.

Email

Generated email body.

Buttons:

Copy

Regenerate

Improve

Edit

Save

The user must be able to edit the generated result before copying it.

7. MEETING NOTES SUMMARIZER

Route:

/meeting-summarizer

Create an interface where users can paste meeting notes.

Input

Fields:

Meeting Title

Meeting Date

Participants

Meeting Notes

Large textarea.

Primary button:

Summarize Meeting

AI Output

Display separate cards for:

Executive Summary

Key Discussion Points

Decisions Made

Action Items

Each action item should contain:

Task

Responsible person

Deadline

Follow-up Recommendations

Buttons:

Copy Summary

Regenerate

Save

Export

The AI must not invent participants, decisions, deadlines, or responsibilities that are not supported by the supplied notes.

8. AI TASK PLANNER

Route:

/task-planner

Create a task planning workspace.

Input

Allow users to add multiple tasks.

Each task should contain:

Task name

Description

Deadline

Priority

Estimated duration

Priority options:

Low

Medium

High

Urgent

Also ask:

Available start time

Available end time

Planning period

Planning period:

Today

This week

Button:

Generate My Plan

AI Output

Create a structured schedule.

Example:

08:00–09:00
High-priority task

09:00–09:30
Email administration

09:30–11:00
Project work

The AI should:

Prioritize urgent and important work

Consider deadlines

Consider estimated task duration

Avoid overlapping tasks

Provide realistic time blocks

Explain prioritization briefly

Allow users to:

Edit tasks

Delete tasks

Regenerate the schedule

Save the plan

9. AI RESEARCH ASSISTANT

Route:

/research-assistant

Create a research workspace.

Input

Allow users to enter:

Research topic

Question

Optional source/article/report text

Desired explanation level

Explanation options:

Quick summary

Beginner

Professional

Detailed

Button:

Research

AI Output

Display:

Summary

Key Insights

Important Findings

Simple Explanation

Recommendations

Questions to Consider

Clearly distinguish between information supplied by the user and AI-generated interpretation.

Add a visible responsible-AI notice:

AI-generated research may contain errors. Verify important information using reliable sources before making decisions.

10. AI ASSISTANT

Route:

/assistant

Create a ChatGPT-style workplace assistant.

The assistant should help users with workplace productivity tasks.

Example requests:

"Write an email asking my manager for leave."

"Help me prioritize these tasks."

"Summarize these meeting notes."

"Explain this report."

"Create a weekly work plan."

The assistant should recommend the appropriate dedicated tool when useful.

For example:

If the user asks for an email, display:

I can help with that. You may also want to use the Email Generator for more control over tone and audience.

Include:

Chat history

Message bubbles

Loading state

Stop/regenerate response

Copy response

Clear conversation

11. HISTORY

Route:

/history

Display previous AI activities.

Create filters:

All

Emails

Meetings

Tasks

Research

Assistant

Each history item should show:

Tool

Title

Date

Preview

Open

Delete

12. SETTINGS

Route:

/settings

Sections:

Profile

Name

Email

Preferences

Default email tone

Default planning hours

Interface preferences

AI Preferences

Response length

Explanation level

Privacy

Explain that users should avoid entering confidential or sensitive information unless their organization permits AI processing.

Account

Logout

Delete account

13. DATABASE

Use Supabase.

Create the following tables.

profiles

Fields:

id

full_name

email

created_at

updated_at

The ID should reference the authenticated user.

email_generations

Fields:

id

user_id

recipient

audience

purpose

important_information

tone

length

subject

generated_email

created_at

meeting_summaries

Fields:

id

user_id

meeting_title

meeting_date

participants

notes

summary

key_points

decisions

action_items

follow_up

created_at

tasks

Fields:

id

user_id

task_name

description

deadline

priority

estimated_duration

status

created_at

task_plans

Fields:

id

user_id

planning_period

start_time

end_time

generated_plan

created_at

research_sessions

Fields:

id

user_id

topic

question

source_text

explanation_level

summary

insights

findings

recommendations

created_at

chat_conversations

Fields:

id

user_id

title

created_at

updated_at

chat_messages

Fields:

id

conversation_id

role

content

created_at

activity_log

Fields:

id

user_id

tool

action

title

created_at

Implement Row Level Security so users can only access their own records.

14. AI ARCHITECTURE

Do not place AI API calls directly inside React components.

Use secure backend/Edge Functions.

Create separate AI functions:

generate-email

summarize-meeting

plan-tasks

research-assistant

workplace-chat

Each function should:

Validate input

Construct the appropriate prompt

Send request to the AI model

Validate the response

Return structured data

Handle errors safely

15. PROMPT ENGINEERING

Create dedicated system prompts for each AI feature.

Every prompt must define:

Role

Task

Context

User input

Constraints

Output format

Quality requirements

Validation rules

Email Prompt

The AI should act as an experienced workplace communication specialist.

Rules:

Do not invent information.

Preserve names, dates, figures and commitments supplied by the user.

Match the selected tone.

Match the selected audience.

Keep the email professional.

Do not add unsupported claims.

Return structured JSON:

{
"subject": "...",
"email": "...",
"suggestions": []
}

Meeting Prompt

Act as a professional meeting analyst.

Extract only information supported by the notes.

Return:

{
"summary": "...",
"key_points": [],
"decisions": [],
"action_items": [],
"follow_up": []
}

Do not invent missing deadlines or responsibilities.

Task Planner Prompt

Act as a professional productivity and time-management assistant.

Prioritize tasks using:

Urgency

Importance

Deadline

Estimated duration

Do not schedule overlapping tasks.

Return structured schedule data.

Research Prompt

Act as a research and information-analysis assistant.

Rules:

Do not fabricate sources.

Do not present uncertain claims as facts.

Clearly distinguish user-provided information from AI interpretation.

Recommend verification for important information.

16. RESPONSIBLE AI

Responsible AI must be visible throughout the application.

Add a small AI disclaimer where appropriate:

AI-generated content may contain errors. Review and verify important information before using it for professional decisions.

The application must:

Avoid fabricated information

Avoid fabricated sources

Avoid invented deadlines

Avoid invented responsibilities

Highlight uncertainty

Encourage verification

Protect user data

Never expose API credentials

Include a dedicated Responsible AI section on the landing page.

17. UI DESIGN

Use a clean, modern SaaS aesthetic.

Design principles:

Professional

Minimal

Spacious

Accessible

Responsive

Easy to navigate

Use:

Rounded cards

Subtle borders

Soft shadows

Clear typography

Consistent spacing

Lucide icons

Modern buttons

Progress/loading indicators

Do not overcrowd the interface.

Use a consistent design system across all pages.

The dashboard should immediately communicate:

What can I do? → Start a task → Get an AI result → Save/use the result

18. COMPONENTS

Create reusable components:

AppSidebar

MobileNavigation

TopNavbar

UserMenu

FeatureCard

StatCard

RecentActivity

AIInputForm

AIResultCard

LoadingState

ErrorState

EmptyState

CopyButton

RegenerateButton

SaveButton

ResponsibleAINotice

ConfirmationDialog

TaskInput

TaskList

ScheduleTimeline

ChatMessage

ChatInput

HistoryItem

Avoid duplicating UI logic.

19. ERROR HANDLING

Every AI feature must handle:

Empty input

Invalid input

API failure

Timeout

Rate limits

Unexpected AI response

Network errors

Display user-friendly messages.

Never expose technical API errors, API keys, stack traces, or sensitive implementation details to users.

20. LOADING STATES

When AI is processing, show an appropriate loading state.

Examples:

Generating your email...

Analyzing your meeting notes...

Building your schedule...

Researching your topic...

Do not freeze the interface.

21. RESPONSIVENESS

The entire application must work well on:

Desktop

Tablet

Mobile

On smaller screens:

Collapse the sidebar

Stack two-column layouts vertically

Make buttons touch-friendly

Keep text readable

Preserve all functionality

22. PRODUCTIVITY VALUE

Make the productivity benefit obvious.

The application should communicate that it helps users:

Save time

Reduce repetitive work

Organize information

Prioritize tasks

Communicate professionally

Understand information faster

Where practical, show activity statistics on the dashboard.

23. DEMO DATA

Create realistic demo examples for development/testing.

Example email request:

"Write a professional email to my manager requesting a meeting to discuss my project progress."

Example meeting notes:

"Team discussed the upcoming product launch. Sarah will finalize the presentation by Friday. James will review the marketing material. The next meeting is scheduled for Monday."

Example tasks:

Complete project report — high priority — 2 hours

Reply to client emails — urgent — 45 minutes

Team meeting — 1 hour

Review presentation — medium — 1 hour

Example research topic:

"Explain how generative AI can improve workplace productivity."

24. SECURITY

Implement:

Supabase authentication

Row Level Security

Secure Edge Functions

Environment variables for API keys

Input validation

Safe error handling

Users must never be able to access another user's saved information.

25. FINAL ACCEPTANCE CRITERIA

The finished application must:

✓ Have working authentication

✓ Have a professional dashboard

✓ Have four functioning AI productivity tools

✓ Have a central AI assistant

✓ Save user activity to Supabase

✓ Have history functionality

✓ Have responsive UI

✓ Use secure AI API calls

✓ Use structured prompts

✓ Include responsible AI safeguards

✓ Handle errors gracefully

✓ Have polished UX

✓ Be presentation-ready

✓ Clearly demonstrate real workplace productivity value

26. BUILD ORDER

Build in this order:

Set up project and design system

Set up Supabase authentication

Create database schema and Row Level Security

Build application layout/navigation

Build dashboard

Build Email Generator

Build Meeting Summarizer

Build Task Planner

Build Research Assistant

Build AI Assistant

Build History

Build Settings

Add responsible-AI safeguards

Add loading/error/empty states

Test all workflows

Improve responsive design

Polish UI

Prepare the application for demonstration

Do not stop after creating the UI mockups.

Implement the actual workflows and connect the AI functionality.

If an AI API key is not yet available, create the complete integration architecture using environment variables and clearly indicate where the key must be configured. Do not hardcode or invent API credentials.

27. FINAL INSTRUCTION

Build the application as a complete working prototype, not merely a static design.

Prioritize:

Functionality

Prompt quality

User experience

Responsible AI

Security

Professional presentation

The final result should look and feel like a credible AI workplace productivity product that could be demonstrated to an employer, client, or assessment panel.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://cleanstate-ai-hub.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/ee607a8d-cf4e-40a0-ba72-63bd05096c31).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
