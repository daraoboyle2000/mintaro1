# Targeted Diagnostic Report

## Scope

This report traces two reported bugs without applying speculative code fixes:

1. Mock participants/applicants do not appear on the researcher side.
2. The dual-thumb participant age slider in the study creator does not respond correctly to touch dragging.

No temporary diagnostic logs were left in the codebase. The conclusions below are from static tracing and local dependency inspection.

---

## A. Mock participant/applicant data investigation

### A1. Mock studies and IDs

`src/data/mockData.ts` defines three mock studies:

| ID | Title | Active | Published |
|---|---|---:|---:|
| `s1` | Daily Fitness Habits Interview | `true` | `true` |
| `s2` | Mobile Banking Usability Study | `true` | `true` |
| `s3` | In-Person Grocery Shopping Diary | `false` | `true` |

### A2. Mock applicants and associated study IDs

`src/data/mockData.ts` defines six researcher-side `mockApplicants`:

| Applicant ID | Name | Age | Status | studyId | unread/isNew |
|---|---|---:|---|---|---|
| `a1` | Jordan Blake | 28 | `Applied` | `s1` | `isNew: true`, `unreadUpdates: 1` |
| `a2` | Amira Patel | 33 | `Booked` | `s2` | `isNew: false`, `unreadUpdates: 0` |
| `a3` | Noah Kim | 24 | `Rejected` | `s3` | `isNew: true`, `unreadUpdates: 1` |
| `a4` | Maya Chen | 31 | `Applied` | `s2` | `isNew: true`, `unreadUpdates: 1` |
| `a5` | Elliot Rivera | 39 | `Booked` | `s1` | `isNew: false`, `unreadUpdates: 0` |
| `a6` | Priya Shah | 42 | `Eligible` | `s3` | `isNew: true`, `unreadUpdates: 1` |

### A3. Mock participant applications and associated study IDs

`src/data/mockData.ts` separately defines three participant-side `mockApplications`:

| Application ID | studyId | status | unreadUpdates | updatedAt |
|---|---|---|---:|---|
| `ap1` | `s1` | `Accepted` | 0 | `2026-04-20` |
| `ap2` | `s2` | `Booked` | 2 | `2026-04-23` |
| `ap3` | `s3` | `Rejected` | 1 | `2026-04-21` |

### A4. Data shape of a mock application/applicant

There are two distinct concepts in the codebase:

#### Researcher-side applicant (`Applicant`)

Expected fields:

```ts
{
  id: string;
  name: string;
  age: number;
  status: 'Applied' | 'Eligible' | 'Booked' | 'Rejected';
  studyId: string;
  summary: string;
  isNew?: boolean;
  unreadUpdates?: number;
}
```

This type has no `participantId`, no nested `participant`/`applicant` object, and no `researcherId`.

#### Participant-side study application (`StudyApplication`)

Expected fields:

```ts
{
  id: string;
  studyId: string;
  status: 'Accepted' | 'Booked' | 'Completed' | 'Rejected';
  unreadUpdates: number;
  updatedAt: string;
}
```

This type also has no `participantId`, no nested `participant`/`applicant` object, and no `researcherId`.

### A5. Canonical type expected by researcher UI

The researcher UI expects `Applicant[]`, not `StudyApplication[]`:

- `app/(researcher)/index.tsx` destructures `applicants: allApplicants` from `useRole()`.
- `app/(researcher)/study/[id].tsx` also destructures `applicants: allApplicants` from `useRole()`.
- The detail screen imports the `Applicant` type and renders `name`, `age`, `summary`, `status`, `studyId`, `isNew`, and `unreadUpdates`.

The canonical researcher-side applicant type is therefore `Applicant`, not participant-side `StudyApplication`.

### A6. Whether mock data matches the researcher type

Yes. `mockApplicants` matches `Applicant[]` exactly. Its statuses are in the expected researcher set: `Applied`, `Eligible`, `Booked`, and `Rejected`.

`mockApplications` does not match the researcher type and is not supposed to. It is participant-side state. Its `Accepted` status is not a valid `Applicant.status`, which is important because researcher screens never look for `Accepted`.

### A7. RoleContext initialization of application/applicant state

`RoleContext` initializes:

- `applications` with `mockApplications`.
- `studies` with `withDefaultStudies()`.
- `applicants` with `mockApplicants`.
- `messages` with `mockMessages`.
- `devModePreset` with `'account-made'`.

So on a first normal provider mount, researcher-side applicants should be present in context.

### A8. Preset hydration / fresh-account overwrite

`hydrateByPreset('fresh-account')` explicitly clears the seeded mock data:

- `setApplications([])`
- `setMessages([])`
- `setApplicants([])`
- `setStudies(() => withDefaultStudies())`

`hydrateByPreset('account-made')` restores `mockApplications`, `mockMessages`, `mockApplicants`, and default studies.

Therefore, if the app enters or remains in the `fresh-account` preset, the exact stage where the researcher applicant count becomes zero is `RoleContext.hydrateByPreset('fresh-account')`, specifically the `setApplicants([])` call. The studies are then restored, so researcher study cards can still exist while all applicant counts are zero.

### A9. Researcher selectors and filters

#### Researcher My Studies (`app/(researcher)/index.tsx`)

Per study:

```ts
const applicants = allApplicants.filter((entry) => entry.studyId === study.id);
const applied = applicants.filter((entry) => entry.status === 'Applied' || entry.status === 'Eligible').length;
const booked = applicants.filter((entry) => entry.status === 'Booked').length;
const rejected = applicants.filter((entry) => entry.status === 'Rejected').length;
```

Important behavior:

- `Eligible` is counted under the displayed `applied` badge.
- `Accepted` is not counted because it is not a researcher applicant status.
- There is no researcher ID filter.
- There is no active/published filter around the list of studies; all studies in context are mapped.

#### Researcher Study Detail (`app/(researcher)/study/[id].tsx`)

For the opened study:

```ts
const applicants = useMemo(
  () => allApplicants.filter((entry) => entry.studyId === id),
  [allApplicants, id]
);
const tabApplicants = applicants.filter((entry) => entry.status === activeTab);
```

Tabs are only:

```ts
['Applied', 'Booked', 'Rejected']
```

Important behavior:

- `Eligible` applicants match the initial study-level `studyId` filter but cannot appear in any tab, because there is no `Eligible` tab and `tabApplicants` requires exact equality with the active tab.
- This means applicant `a6` for `s3` is invisible on the detail screen unless the UI maps `Eligible` into the Applied tab or adds an Eligible tab.
- `s3` is `isActive: false` but still `isPublished: true`; the detail screen shows tabs for it because it only gates on `isPublished !== false`.

#### Researcher applicants tab (`app/(researcher)/applicants.tsx`)

This file exists, but it imports and renders `mockApplicants` directly rather than context `applicants`. It only reads `studies` from `useRole()`. It is also configured in the researcher tab layout with `href: null`, so it is not exposed as a normal visible tab.

### A10. Mismatch inventory

| Category | Finding |
|---|---|
| Study IDs | `mockApplicants.studyId` values match `mockStudies.id` values (`s1`, `s2`, `s3`). No ID mismatch in seed data. |
| Researcher IDs | No `researcherId` exists on `Study`, `Applicant`, or `StudyApplication`, and no researcher-side selector filters by researcher ID. |
| `applications` vs `applicants` | Researcher screens use `applicants`; participant screens use `applications`. The shapes and statuses differ. Confusing these would yield empty or incorrect researcher results. |
| `participants` | There is no separate participant collection for researcher applicant rendering. `Applicant` is a flattened display record. |
| Statuses | Researcher uses `Applied`, `Eligible`, `Booked`, `Rejected`. Participant applications use `Accepted`, `Booked`, `Completed`, `Rejected`. `Eligible` is counted as applied on the My Studies list but is invisible in study detail tabs. `Accepted` is never a researcher applicant status. |
| Published/active | Researcher detail only hides applicant tabs when `isPublished === false`; inactive but published studies still show applicant tabs. The My Studies list does not filter inactive/unpublished studies. |

### A11. Whether researcher screens read mock data directly or only RoleContext

- `app/(researcher)/index.tsx`: reads applicants only from `RoleContext`.
- `app/(researcher)/study/[id].tsx`: reads applicants only from `RoleContext`.
- `app/(researcher)/applicants.tsx`: reads `mockApplicants` directly, but this screen is hidden from the tab bar via `href: null` and is not the primary My Studies flow.

### A12. Exact point where expected applicant count becomes zero

For the main researcher screens, the expected count becomes zero before rendering, when `RoleContext` state has `applicants = []`.

The code path that explicitly creates this state is `hydrateByPreset('fresh-account') -> setApplicants([])`. After that:

1. `app/(researcher)/index.tsx` receives `allApplicants.length === 0` from context.
2. Its per-study filter `allApplicants.filter((entry) => entry.studyId === study.id)` returns `[]` for every study.
3. `applied`, `booked`, and `rejected` badges become `0`.
4. `app/(researcher)/study/[id].tsx` receives `allApplicants.length === 0` from context.
5. Its study-level filter returns `[]`.
6. The tab filter also returns `[]`.
7. The empty state renders.

If context is not in the fresh-account state, seeded applicants should appear for `s1` and `s2`; `a6` remains hidden in the detail tab because `Eligible` is not a tab.

### A13. Diagnostic logging plan and expected demonstration

No logs were committed. If temporary logs are needed during device reproduction, add them only around the selectors with prefix `[Applicant debug]`:

- In `RoleContext` after hydration: total `applicants.length` and each `{ id, studyId, status }`.
- In `app/(researcher)/index.tsx`: current study ID, count after `studyId` filter, counts after status filters.
- In `app/(researcher)/study/[id].tsx`: route `id`, total context applicants, count after `studyId`, active tab, count after tab filter.

Expected result if the persistent bug is caused by preset hydration: logs show context applicants go from six seeded records to zero immediately after `hydrateByPreset('fresh-account')`, before any researcher selector runs.

---

## B. Age slider touch investigation

### B1. Component hierarchy around the slider

The slider is implemented inline in `app/(researcher)/create-study.tsx` as `DualAgeSlider`.

Hierarchy:

```tsx
<CreateStudyScreen>
  <ScrollView ref={scrollRef} ... keyboardShouldPersistTaps="handled">
    <Card>
      <Text>Eligibility criteria</Text>
      <View style={styles.criteriaBlock}>
        <Text>Age range: {ageMin}–{ageMax}</Text>
        <DualAgeSlider min={ageMin} max={ageMax} onChange={...} />
      </View>
      ...other eligibility controls...
    </Card>
  </ScrollView>
</CreateStudyScreen>
```

Inside `DualAgeSlider`:

```tsx
<View style={styles.dualSlider} onLayout={...}>
  <View style={styles.sliderTrack}>
    <View style={styles.sliderFill} />
  </View>
  <View {...minResponder.panHandlers} style={[styles.sliderThumb, { left: `${minPct}%` }]}>
    <Text>{min}</Text>
  </View>
  <View {...maxResponder.panHandlers} style={[styles.sliderThumb, { left: `${maxPct}%` }]}>
    <Text>{max}</Text>
  </View>
</View>
```

### B2. Whether it sits inside a ScrollView

Yes. The slider is inside the create-study screen's root `ScrollView`.

### B3. Relevant parent ScrollView props

The root `ScrollView` uses:

```tsx
<ScrollView
  ref={scrollRef}
  style={styles.container}
  contentContainerStyle={styles.content}
  keyboardShouldPersistTaps="handled"
>
```

It does not set props such as:

- `scrollEnabled={...}`
- `nestedScrollEnabled`
- `directionalLockEnabled`
- `disableScrollViewPanResponder`
- `keyboardDismissMode`

### B4. Where PanResponder/touch handlers are attached

The PanResponder handlers are attached only to the two thumb views:

- `minResponder.panHandlers` on the minimum thumb view.
- `maxResponder.panHandlers` on the maximum thumb view.

Handlers are not attached to the track, fill, or outer slider wrapper. Tapping or dragging the track has no responder code path.

### B5. Responder callback return values

For both min and max thumbs:

- `onStartShouldSetPanResponder: () => true`
- `onStartShouldSetPanResponderCapture: () => true`
- `onMoveShouldSetPanResponder: () => true`
- `onMoveShouldSetPanResponderCapture: () => true`

No termination request callback is defined, so default termination behavior applies.

### B6/B7. Whether responder callbacks and pan callbacks fire on Android

This cannot be confirmed from static code alone. However, because handlers are only on the 32x32 thumb views, Android will only enter this responder path when the initial touch lands on a thumb's actual hit area. Starting a gesture on the visible track will not fire any of these callbacks.

If the initial touch is on a thumb and the ScrollView does not terminate the responder, the code should call:

- `onPanResponderGrant`: copies `values.current` into `start.current`.
- `onPanResponderMove`: calculates a next value from `gesture.dx` and calls `onChange`.

No `onPanResponderRelease` is defined, so there is no release logging or cleanup.

### B8/B9. Measured track/slider width

The measured value is not the track width specifically. `onLayout` is attached to the outer `styles.dualSlider` wrapper, not `styles.sliderTrack`.

Initial width state is `1`, then layout updates it to `Math.max(event.nativeEvent.layout.width, 1)`. Therefore width should never be zero in state, but it can be stale at `1` before layout occurs. If a drag somehow starts before layout, a tiny `dx` would produce a huge age jump because `(dx / 1) * 82` is used.

### B10/B11. Coordinate calculation method and coordinate mixing

The current calculation uses only `gesture.dx`:

```ts
startValue + (dx / width) * AGE_SPAN
```

It does not use:

- `locationX`
- `pageX`
- `moveX`
- measured screen position
- track-relative coordinates

Because it uses `dx` relative to the responder grant and divides by outer slider width, it does not directly mix screen-relative and component-relative coordinates. The bigger limitation is that the touch must start on a thumb, and the calculation is relative-delta only, so track taps/drags cannot reposition a thumb.

### B12. Whether the parent ScrollView can steal the gesture

Yes, it is plausible. The slider is inside a vertical `ScrollView`, and the thumb responders do not define `onPanResponderTerminationRequest: () => false`. Even though the start/move responder callbacks return `true`, Android ScrollView negotiation can still interfere with child gestures, especially if the movement has any vertical component or the child is small.

This is a plausible contributor, but the primary deterministic issue from the code is the extremely small hit target and lack of track-level responder handling.

### B13. Other view interception risks

No explicit `pointerEvents` are used. The thumbs are absolutely positioned. The track has `overflow: 'hidden'`, but the thumbs are siblings of the track, not children of it, so track overflow does not clip them.

Potential hit/interception issue:

- Thumb hit area is exactly the styled 32x32 view.
- There is no `hitSlop` because `View` with pan handlers does not receive a `hitSlop` prop here.
- `styles.dualSlider` height is 54; the touchable visual thumb is 32 high and absolutely positioned without a `top`, so layout/hit behavior depends on absolute positioning defaults. The actual draggable target is still just the 32x32 thumb.

### B14. Actual touch/hit area of each thumb

Each thumb is:

```ts
width: 32,
height: 32,
borderRadius: 16,
position: 'absolute',
marginLeft: -16,
left: `${pct}%`
```

So each thumb's hit area is approximately 32 by 32 density-independent pixels. There is no expanded invisible hit area.

### B15. Track tapping vs thumb dragging paths

They use different paths in practice:

- Thumb dragging has a PanResponder path.
- Track tapping/dragging has no path at all.

If the user expects to tap or drag from anywhere on the track, the current implementation will appear non-responsive.

### B16. Whether state changes while visual thumb fails to move, or no value update occurs

From static tracing:

- If `onPanResponderMove` fires, `onChange` updates parent state (`setAgeMin`, `setAgeMax`), which feeds new `min`/`max` props back into `DualAgeSlider`, recomputes `minPct`/`maxPct`, and moves the visual thumb.
- Therefore, if state updates occur, the visual should move.
- The more likely failure mode is that no value update occurs because the responder path never starts or is terminated by the parent ScrollView.

### B17. Diagnostic logging plan and expected demonstration

No logs were committed. If reproducing on device, add temporary logs with `[Age slider debug]`:

- `onLayout`: outer slider width and, if measured with a ref, screen X/page position.
- Each responder decision: start/move/capture callback name and returned value.
- `onPanResponderGrant`: active thumb and current min/max.
- `onPanResponderMove`: active thumb, `gesture.dx`, `gesture.moveX`, calculated age, min/max before/after.
- `onPanResponderRelease`/terminate: active thumb and final min/max.

Expected result for the observed failure: track touches produce no PanResponder logs because the track has no handlers; thumb touches may produce grant/move logs only if the initial touch lands inside the 32x32 thumb and the ScrollView does not take over.

---

## C. React Native mismatch

### C1. Version requested by package.json

`package.json` requests:

- `expo`: `~54.0.0`
- `react`: `19.0.0`
- `react-native`: `0.79.6`

### C2. Version installed in node_modules

Local inspection shows:

- `node_modules/expo/package.json`: `54.0.35`
- `node_modules/react-native/package.json`: `0.79.6`

So JavaScript React Native is exactly what `package.json` requests: `0.79.6`.

### C3. Could this mismatch affect PanResponder/touch behavior?

Yes, it is plausible as a contributory factor. The debugger reports JavaScript React Native `0.79.6` while native Expo Go is `0.81.5`. PanResponder is implemented across JS responder negotiation and native touch dispatch. A native/JS React Native mismatch can produce broad runtime inconsistencies, and touch/responder behavior is in the category that could be affected.

However, this mismatch is not needed to explain the slider failure. The slider has deterministic implementation problems even in a correctly aligned runtime:

- handlers only on 32x32 thumbs;
- no track-level responder;
- relative `dx`-only movement;
- inside a vertical ScrollView;
- no `onPanResponderTerminationRequest` guard;
- no expanded hit area.

Therefore, the mismatch is best classified as contributory risk, not the sole root cause.

### C4. Correct Expo SDK 54-compatible alignment

Expo SDK 54 is the React Native 0.81 generation, and the native Expo Go version reported here is `0.81.5`. For SDK 54 / Expo Go 0.81.5 alignment, this app should not be pinned to `react-native: 0.79.6`.

The safe way to determine and apply exact compatible versions is `npx expo install --fix` or `npx expo install react react-native ...` for the current Expo SDK, but this diagnostic task intentionally does not change dependencies. A local `npx expo install --check` attempt could not complete because dependency metadata fetch failed in the environment, so this report does not modify versions.

---

## Required conclusion

### Most likely root cause of missing mock applicants

The most likely root cause is preset hydration into `fresh-account`, which explicitly clears `RoleContext`'s `applicants` state with `setApplicants([])` while restoring default studies. That yields visible researcher studies with zero applicants everywhere in the primary researcher flow.

A secondary UI bug exists: `Eligible` applicants are counted as applied on the My Studies list but cannot render in any study-detail tab because the tab list excludes `Eligible` and the detail filter uses exact status equality.

### Exact stage where applicants disappear

They disappear in `src/context/RoleContext.tsx` inside `hydrateByPreset('fresh-account')` at `setApplicants([])`. The subsequent researcher selectors receive an already-empty `allApplicants` array.

### Most likely root cause of slider touch failure

The most likely root cause is the slider's responder design: PanResponder handlers are attached only to two small 32x32 thumb views inside a vertical ScrollView, while the track has no responder path and there is no expanded hit area or termination guard. Touches that begin on the track do nothing, and thumb drags are easy for users to miss or for ScrollView gesture negotiation to disrupt.

### React Native mismatch classification

The React Native mismatch is likely contributory, not primary. It can plausibly affect touch/responder behavior because JS is using React Native `0.79.6` while Expo Go native reports `0.81.5`, but the slider has sufficient local implementation issues to explain the failure independently.

### Smallest safe fix for missing applicants

Smallest safe fix options:

1. Ensure dev preset selection does not leave researcher testing in `fresh-account` when mock applicants are expected; or
2. If researcher fresh accounts should still show mock demo applicants, change `hydrateByPreset('fresh-account')` to preserve or reseed `mockApplicants` for researcher mode; and
3. Map `Eligible` into the Applied tab or add an `Eligible` tab so all seeded applicants can appear on study details.

Files likely needing modification:

- `src/context/RoleContext.tsx`
- `app/(researcher)/study/[id].tsx`
- possibly whichever setup/dev preset screen invokes `hydrateByPreset('fresh-account')`

### Smallest safe fix for slider touch

Smallest safe fix:

1. Add a track/outer-slider responder or press/gesture path that converts track-relative coordinates to age values.
2. Expand thumb hit areas, likely by wrapping thumbs in larger responder views or using pressable hit slop-compatible wrappers.
3. Guard against ScrollView stealing active horizontal drags, either with responder termination handling and/or temporarily disabling parent scroll while dragging.
4. Use measured track-relative coordinates rather than only thumb-start-relative `dx` for tap/drag positioning.

Files likely needing modification:

- `app/(researcher)/create-study.tsx`
- or an extracted slider component if the slider is refactored out later

### Dependency files intentionally not modified

Do not change dependency versions as part of this diagnostic. The relevant files, if a separate dependency alignment task is approved later, would be:

- `package.json`
- `package-lock.json`
