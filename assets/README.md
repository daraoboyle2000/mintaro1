# Mintaro Assets README

This document describes the purpose of each image and icon in the `assets/` folder and how they are intended to be used within the Mintaro application. The goal is to ensure consistent usage across the UI and make it easy for developers (including automated agents like Codex) to reference the correct asset for each feature.

---

# Design Principles

All icons should follow these guidelines unless explicitly stated otherwise:

* Minimalist, flat mobile UI style
* Mintaro green accent color
* White or transparent background
* Clear meaning at small sizes
* Consistent stroke thickness and visual weight
* Suitable for Android and iOS mobile interfaces

---

# Folder Structure

```
assets/
  icons/
  illustrations/
  placeholders/
  avatars/
  onboarding/
```

---

# TAB BAR ICONS

These icons are used in the bottom navigation bar for participant and researcher modes.

## tab-browse.png

**Meaning:** Browse available studies.

**Used in:**

* Participant bottom navigation
* Main entry point for discovering studies

**UI Context:**

* Bottom tab icon
* May highlight when active

---

## tab-my-studies.png

**Meaning:** User's study applications and participation history.

**Used in:**

* Participant bottom navigation
* Notification counter may appear above this icon

**UI Context:**

* Bottom tab icon
* May display unread update count

---

## tab-profile.png

**Meaning:** User profile and account settings.

**Used in:**

* Participant bottom navigation
* Researcher bottom navigation

**UI Context:**

* Bottom tab icon

---

## tab-dashboard.png

**Meaning:** Researcher overview of studies.

**Used in:**

* Researcher bottom navigation
* Main management screen

**UI Context:**

* Bottom tab icon

---

## tab-create.png

**Meaning:** Create a new study.

**Used in:**

* Researcher bottom navigation

**UI Context:**

* Bottom tab icon
* Action-oriented icon

---

# STUDY INFORMATION ICONS

These icons appear on study cards and study detail pages.

## location-pin.png

**Meaning:** Study location.

**Used in:**

* Study cards
* Study detail pages
* Profile location fields

---

## euro-reward.png

**Meaning:** Monetary reward for participation.

**Used in:**

* Study cards
* Study detail pages
* Payment summaries

---

## clock-duration.png

**Meaning:** Time required to complete the study.

**Used in:**

* Study cards
* Study detail pages

---

## online-study.png

**Meaning:** Study is conducted remotely.

**Used in:**

* Study cards
* Filters

---

## in-person-study.png

**Meaning:** Study requires physical attendance.

**Used in:**

* Study cards
* Filters

---

## hybrid-study.png

**Meaning:** Study can be completed both online and in person.

**Used in:**

* Study cards
* Filters

---

## filter-sliders.png

**Meaning:** Filter or adjust search criteria.

**Used in:**

* Browse screen
* Filter modal

---

## search.png

**Meaning:** Search functionality.

**Used in:**

* Browse screen search bar

---

## apply-check.png

**Meaning:** Application submitted successfully.

**Used in:**

* Apply animation confirmation
* Application status display

**Note:**

This icon also represents completed participation where a simple success indicator is sufficient. A separate "completed" icon is intentionally not used.

---

## eligibility.png

**Meaning:** Eligibility requirements or screening criteria.

**Used in:**

* Study detail page
* Eligibility questionnaire prompts

---

## new-badge.png

**Meaning:** New update or unread information.

**Used in:**

* Study cards
* Notification indicators

---

# APPLICATION STATUS ICONS

These icons represent the state of a user's application.

## status-applied.png

**Meaning:** User has applied to the study.

**Used in:**

* My Studies screen
* Application status indicators

---

## status-accepted.png

**Meaning:** User has been accepted into the study.

**Used in:**

* My Studies screen
* Notifications

---

## status-rejected.png

**Meaning:** User has been rejected from the study.

**Used in:**

* My Studies screen
* Notifications

---

## status-pending.png

**Meaning:** Application is under review.

**Used in:**

* My Studies screen

---

# CHAT AND COMMUNICATION ICONS

## chat.png

**Meaning:** Open conversation with researcher or participant.

**Used in:**

* Study cards
* My Studies screen
* Messaging interface

---

## send-message.png

**Meaning:** Send a message.

**Used in:**

* Chat interface

---

## unread-dot.png

**Meaning:** Unread notification indicator.

**Used in:**

* Chat icon
* My Studies tab
* Notification badges

---

# PROFILE ICONS

## profile-camera.png

**Meaning:** Upload or change profile picture.

**Used in:**

* Profile editing screen

---

## profile-edit.png

**Meaning:** Edit profile information.

**Used in:**

* Profile screen

---

## profile-location.png

**Meaning:** User location information.

**Used in:**

* Profile screen

---

## profile-health.png

**Meaning:** Health or eligibility details.

**Used in:**

* Profile questionnaire
* Eligibility fields

---

## profile-payment.png

**Meaning:** Payment or reward settings.

**Used in:**

* Profile settings

---

# PLACEHOLDER STUDY IMAGES

These images provide visual context for studies before researchers upload real photos.

## study-health.png

**Meaning:** General medical or health study.

**Used in:**

* Study cards
* Study detail page

---

## study-online-survey.png

**Meaning:** Online questionnaire or remote participation.

**Used in:**

* Study cards

---

## study-lab.png

**Meaning:** Laboratory-based research study.

**Used in:**

* Study cards

---

# ONBOARDING ILLUSTRATIONS

These images are used in first-time user flows and tutorials.

## onboarding-support-science.png

**Meaning:** Users contributing to research.

**Used in:**

* Welcome screens
* Tutorial introduction

---

## onboarding-get-rewarded.png

**Meaning:** Participants receiving rewards.

**Used in:**

* Onboarding flow

---

## onboarding-find-studies.png

**Meaning:** Discovering available studies.

**Used in:**

* Onboarding flow

---

# Notes for Developers

1. Do not rename asset files without updating references in code.
2. Keep icon sizes consistent unless a specific UI requires otherwise.
3. New icons should follow the same visual style as existing ones.
4. Avoid adding duplicate icons with slightly different meanings.
5. All assets should be stored in the `assets/` directory and referenced using relative paths.

---

# Future Asset Categories (Optional)

These may be added later as the application evolves:

* Notifications icons
* Analytics icons
* Payment method logos
* Institution logos
* Tutorial step indicators

---

End of document.
