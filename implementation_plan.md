# Implementation Plan - Feature: Forgot Medication Past Date & PDF Export Update

## User Requirements
1.  **Forgot Past Medication:** Allow users to log missed medications for dates other than today. This should be an "extra option" and not disrupt the main flow.
2.  **PDF Export:** Include a list of currently active medications in the PDF export.

## Status: Completed

### 1. Feature: Forgot Past Medication
- [x] **New Component:** Created `src/components/LogMissedDoseModal.vue`.
    -   Implemented date selection logic.
    -   Implemented medication list filtering for the selected date.
    -   Added toggle functionality for "Taken" vs "Missed".
- [x] **Dashboard Integration:** Updated `src/components/Dashboard.vue`.
    -   Added "Log Past Missed Dose" link in the Medication Status section.
    -   Imported and utilized the new modal.
- [x] **Internationalization:** Added translation keys to `en.json` and `nl.json`.

### 2. Feature: PDF Export Update
- [x] **UI Update:** Updated `src/components/ExportPdfModal.vue`.
    -   Added "Include Current Medications" checkbox.
    -   Passed the new option to the export function.
- [x] **Export Logic:** Updated `src/composables/usePdfExport.js`.
    -   Implemented logic to fetch active medications.
    -   Added a new table section in the PDF for "Current Medications".
    -   Added appropriate headers and formatting.
- [x] **Internationalization:** Added translation keys for PDF report sections.

## Verification
-   **Past Date Logging:** Verified via `LogMissedDoseModal` that users can select a past date and log missed doses.
-   **PDF Export:** Verified that the "Current Medications" section appears in the generated PDF when the option is selected.
