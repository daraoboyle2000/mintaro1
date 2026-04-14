# Mintaro Alpha (Expo + Expo Router)

Mintaro is a dual-sided mobile MVP connecting members of the public with paid research studies.

This repository now contains the **first working alpha scaffold** with:
- Participant flow (browse, study details, applications, profile)
- Researcher flow (dashboard, create study, applicants, profile)
- Role selection entry point
- Shared green/white Mintaro design system
- Mock data only (no backend yet)

## Tech stack
- Expo (React Native)
- TypeScript
- Expo Router (file-based navigation)

## Install
```bash
npm install
```

## Run
```bash
npm run start
```

Optional platforms:
```bash
npm run ios
npm run android
npm run web
```

## Project structure

```text
app/
  _layout.tsx                    # Root stack + providers
  index.tsx                      # Entry redirect based on role
  (auth)/
    welcome.tsx                  # Role selection + onboarding
    continue.tsx                 # Placeholder sign-in/continue
  (participant)/
    _layout.tsx                  # Participant tabs
    index.tsx                    # Browse studies
    applications.tsx             # My studies/applications
    profile.tsx                  # Participant profile
  (researcher)/
    _layout.tsx                  # Researcher tabs
    index.tsx                    # Dashboard
    create-study.tsx             # Study creation placeholder
    applicants.tsx               # Applicants list
    profile.tsx                  # Researcher profile
  study/[id].tsx                 # Shared study detail screen

src/
  components/ui/                 # Reusable UI components
  context/RoleContext.tsx        # Local role state
  data/mockData.ts               # Mock studies + applicants
  theme/index.ts                 # Colors, spacing, radius, typography
  types/index.ts                 # Shared app types
```

## Current MVP scope
- Light theme only (prepared for future dark mode support via shared theme object)
- Local mock state only
- Role selection and role-based navigation shell
- Mock participant browse/apply experience
- Mock researcher management experience

## Out of scope (intentionally)
- Real authentication
- Firebase integration
- Firestore persistence
- Payments
- Real-time chat
- Full scheduling

## Next planned implementation steps
1. Add Firebase Auth for participant and researcher accounts.
2. Add Firestore collections for users, studies, and applications.
3. Replace mock data with typed service/repository layer.
4. Implement application submission and status updates.
5. Add payment provider integration after study completion workflows are stable.
