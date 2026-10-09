# Requirements Document

## Introduction

The **Todo Life Dashboard** is a standalone single-page web application that helps users organize their day at a glance. It combines a live clock with a contextual greeting, a Pomodoro-style focus timer, a persistent to-do list, and a quick-links launcher — all running entirely in the browser with no backend. Data is persisted via the browser's Local Storage API, and the app must work offline as a plain HTML file opened directly from disk.

Three additional challenges are in scope: a Light/Dark mode toggle, a customizable display name in the greeting, and an adjustable Pomodoro duration.

---

## Glossary

- **Dashboard**: The single HTML page that contains all widgets described in these requirements.
- **Clock**: The widget in the header card that displays the current local time and date.
- **Greeting**: The text element below the date that addresses the user by name and reflects the time of day.
- **Timer**: The Pomodoro-style focus countdown widget.
- **Task_Manager**: The widget that manages the user's to-do list.
- **Task**: A single item in the to-do list, consisting of a text label and a completion state.
- **Quick_Links**: The widget that stores and launches user-defined URL bookmarks.
- **Link**: A single bookmark entry consisting of a display name and a URL.
- **Theme**: The visual color scheme applied to the entire Dashboard, either "light" or "dark".
- **Display_Name**: The user's preferred name shown in the Greeting, stored in Local Storage.
- **Pomodoro_Duration**: The countdown length of the Timer in minutes, configurable by the user.
- **Local_Storage**: The browser's `localStorage` API used as the sole persistence mechanism.
- **Session**: A single browser page load from open to close or refresh.

---

## Requirements

### Requirement 1: Live Clock and Date Display

**User Story:** As a user, I want to see the current time and date prominently displayed, so that I can stay aware of the time without leaving the Dashboard.

#### Acceptance Criteria

1. THE Clock SHALL display the current local time in HH:MM:SS format, updated every second.
2. THE Clock SHALL display the current local date below the time, formatted as the full weekday name, full month name, day, and four-digit year (e.g., "Monday, July 14, 2025").
3. WHEN the Dashboard page loads, THE Clock SHALL begin updating within 1 second of the page becoming interactive, without requiring user interaction.
4. WHILE the Dashboard page is open, THE Clock SHALL update the time display every second such that no increment is skipped or repeated.
5. WHEN the Dashboard tab becomes visible again after being hidden (e.g., the user switches back to the tab), THE Clock SHALL re-sync the displayed time to the current local time within 1 second.

---

### Requirement 2: Contextual Greeting

**User Story:** As a user, I want to see a personalized greeting based on the time of day, so that the Dashboard feels relevant and welcoming each time I open it.

#### Acceptance Criteria

1. WHEN the local time is between 05:00 (inclusive) and 12:00 (exclusive), THE Greeting SHALL display the prefix "Good morning".
2. WHEN the local time is between 12:00 (inclusive) and 17:00 (exclusive), THE Greeting SHALL display the prefix "Good afternoon".
3. WHEN the local time is between 17:00 (inclusive) and 21:00 (exclusive), THE Greeting SHALL display the prefix "Good evening".
4. WHEN the local time is between 21:00 (inclusive) and 05:00 (exclusive) of the following day, THE Greeting SHALL display the prefix "Good night".
5. THE Greeting SHALL display the full greeting in the format "[Prefix], [Display_Name]!" (e.g., "Good morning, Alex!").
6. IF no Display_Name has been set by the user, THEN THE Greeting SHALL use the default name "Friend".
7. THE Greeting prefix SHALL be determined once when the Dashboard loads and SHALL NOT change automatically as time passes during an open session.

---

### Requirement 3: Custom Display Name

**User Story:** As a user, I want to enter and save my preferred display name, so that the Dashboard greets me personally across sessions.

#### Acceptance Criteria

1. THE Dashboard SHALL provide a text input field of maximum 50 characters that allows the user to enter or update the Display_Name.
2. WHEN the user submits a Display_Name that is non-empty after trimming leading and trailing whitespace, THE Dashboard SHALL save the trimmed Display_Name to Local_Storage under the key `displayName` and display a visual confirmation that the name was saved.
3. IF the user submits a Display_Name that exceeds 50 characters after trimming, THEN THE Dashboard SHALL reject the input, retain the previously saved Display_Name, and display an error message indicating the 50-character limit.
4. WHEN the Dashboard page loads, THE Dashboard SHALL read the Display_Name from Local_Storage and display it in the Greeting.
5. IF Local_Storage does not contain a Display_Name entry, THEN THE Greeting SHALL display the default name "Friend".
6. WHEN the user clears the Display_Name input and submits an empty or whitespace-only value, THE Greeting SHALL revert to the default name "Friend".
7. WHEN the user submits an empty or whitespace-only Display_Name, THE Dashboard SHALL remove or clear the `displayName` key from Local_Storage.

---

### Requirement 4: Focus Timer

**User Story:** As a user, I want a countdown timer I can start, stop, and reset, so that I can manage focused work sessions.

#### Acceptance Criteria

1. WHEN the Dashboard loads and no Pomodoro_Duration has been saved, THE Timer SHALL initialize to a default countdown of 25 minutes (25:00).
2. WHEN the user activates the Start control and the Timer is not already counting down, THE Timer SHALL begin counting down in one-second decrements, displaying the remaining time in MM:SS format.
3. WHEN the user activates the Stop control, THE Timer SHALL pause the countdown and retain the remaining time.
4. WHEN the user activates the Reset control, THE Timer SHALL stop any active countdown and restore the display to the currently saved Pomodoro_Duration, or to 25:00 if no Pomodoro_Duration has been saved.
5. WHEN the countdown reaches 00:00, THE Timer SHALL stop automatically and display a visible completion indicator on the Dashboard.
6. WHILE the Timer is counting down, THE Dashboard SHALL ignore any additional Start control activations so that exactly one countdown progresses at a time.

---

### Requirement 5: Adjustable Pomodoro Duration

**User Story:** As a user, I want to change the focus timer duration, so that I can adapt work sessions to different task lengths.

#### Acceptance Criteria

1. THE Dashboard SHALL provide a numeric input that accepts integer values between 1 and 180 (inclusive) as the Pomodoro_Duration in minutes.
2. WHEN the user commits a new Pomodoro_Duration value (via Enter key or input blur) and the Timer is not running, THE Timer SHALL update its display to the new duration immediately.
3. WHEN the user commits a new Pomodoro_Duration value while the Timer is running, THE Timer SHALL stop the current countdown.
4. WHEN the Timer has been stopped due to a Pomodoro_Duration change, THE Timer SHALL reset its display to the new Pomodoro_Duration.
5. IF the user enters a value outside the range 1–180 or a non-integer, THEN THE Dashboard SHALL reject the input, retain the previous Pomodoro_Duration, and display an error message stating the valid range (1–180 minutes).
6. WHEN the user commits a valid Pomodoro_Duration, THE Dashboard SHALL save it to Local_Storage under the key `pomodoroDuration`.
7. WHEN the Dashboard page loads and Local_Storage contains a valid `pomodoroDuration` value, THE Dashboard SHALL initialize the Timer to that saved Pomodoro_Duration.
8. WHEN the Dashboard page loads and Local_Storage does not contain a `pomodoroDuration` value, THE Dashboard SHALL initialize the Timer to the default duration of 25 minutes.

---

### Requirement 6: To-Do List — Add and Display Tasks

**User Story:** As a user, I want to add tasks and see them in a list, so that I can track what I need to do today.

#### Acceptance Criteria

1. THE Task_Manager SHALL provide a text input field and an Add button for entering new tasks.
2. WHEN the user submits a task text that is non-empty after trimming leading and trailing whitespace, and does not exceed 100 characters after trimming, THE Task_Manager SHALL append a new Task containing the trimmed text to the bottom of the list and save all tasks to Local_Storage under the key `tasks`.
3. IF the user attempts to submit a task text that is empty or contains only whitespace, THEN THE Task_Manager SHALL reject the submission, display no new Task, and display an inline error message indicating that the task text cannot be empty.
4. IF the task text exceeds 100 characters after trimming, THEN THE Task_Manager SHALL reject the submission and display an inline error message indicating the 100-character limit.
5. WHEN the Dashboard page loads, THE Task_Manager SHALL read tasks from Local_Storage under the key `tasks` and render all previously saved tasks in the order they were added.
6. IF Local_Storage under the key `tasks` is empty or unreadable on Dashboard page load, THEN THE Task_Manager SHALL render an empty task list with no error shown to the user.
7. THE Task_Manager SHALL display each Task with its text label, a completion checkbox, and a Delete button.
8. IF a Local_Storage save operation fails, THEN THE Task_Manager SHALL retain the new Task in the in-memory task list and display an error message indicating the change could not be saved persistently.

---

### Requirement 7: To-Do List — Complete and Delete Tasks

**User Story:** As a user, I want to mark tasks as done and delete tasks I no longer need, so that I can maintain an accurate to-do list.

#### Acceptance Criteria

1. WHEN the user toggles the completion checkbox of a Task, THE Task_Manager SHALL update the Task's completion state and save the updated task list to Local_Storage.
2. WHILE a Task is in the completed state, THE Task_Manager SHALL apply a strikethrough style to the Task text to differentiate it from incomplete tasks.
3. WHEN the user toggles a completed Task back to incomplete, THE Task_Manager SHALL remove the strikethrough style from the Task text.
4. WHEN the user activates the Delete button of a Task, THE Task_Manager SHALL remove that Task from the list and save the updated task list to Local_Storage.
5. WHEN all tasks are deleted, THE Task_Manager SHALL display an empty list with a placeholder message (e.g., "No tasks yet") and no error state.
6. IF a Local_Storage save operation fails (e.g., quota exceeded), THEN THE Task_Manager SHALL retain the change in the in-memory task list and display an error message indicating that the change could not be saved persistently.

---

### Requirement 8: To-Do List — Edit Tasks

**User Story:** As a user, I want to edit an existing task's text, so that I can correct mistakes or refine task descriptions.

#### Acceptance Criteria

1. WHEN the user double-clicks a Task's text label or activates an Edit button on a Task, THE Task_Manager SHALL enter edit mode for that Task.
2. WHEN the Task_Manager enters edit mode for a Task, THE Task_Manager SHALL replace the Task's text label with an editable input pre-populated with the current task text, and the input SHALL receive focus immediately.
3. WHEN the user confirms the edit by pressing Enter or activating a Save button, and the input value is non-empty after trimming, THE Task_Manager SHALL update the Task's text to the trimmed value, exit edit mode, restore the text label, and save the updated task list to Local_Storage.
4. IF the user confirms the edit and the input value is empty or whitespace-only after trimming, THEN THE Task_Manager SHALL discard the edit, restore the original task text label, and exit edit mode without modifying Local_Storage.
5. WHEN the user cancels the edit by pressing Escape or activating a Cancel button, THE Task_Manager SHALL restore the original task text label and exit edit mode without modifying Local_Storage.

---

### Requirement 9: Quick Links — Add and Display

**User Story:** As a user, I want to save links to my favorite websites, so that I can open them quickly from the Dashboard.

#### Acceptance Criteria

1. THE Quick_Links widget SHALL provide two text input fields — one for the Link display name (maximum 100 characters) and one for the URL — and an Add Link button.
2. WHEN the user submits a Link with a non-empty display name and a URL that begins with `http://` or `https://`, THE Quick_Links widget SHALL add the Link to the list and save all links to Local_Storage under the key `quickLinks`.
3. IF the user attempts to submit a Link with an empty display name or an empty URL, THEN THE Quick_Links widget SHALL reject the submission, add no new Link, and display an error message indicating which field is missing.
4. IF the user attempts to submit a Link with a non-empty URL that does not begin with `http://` or `https://`, THEN THE Quick_Links widget SHALL reject the submission, add no new Link, and display an error message indicating the URL format is invalid.
5. WHEN the Dashboard page loads, THE Quick_Links widget SHALL read links from Local_Storage under the key `quickLinks`; IF the key is absent or its value cannot be parsed as a list, THEN THE Quick_Links widget SHALL render an empty links list without displaying an error to the user.
6. WHEN the user activates a Link button, THE Quick_Links widget SHALL open the associated URL in a new browser tab.
7. IF saving the updated links to Local_Storage fails, THEN THE Quick_Links widget SHALL retain the new Link in the displayed list and display an error message indicating that the change could not be saved persistently.

---

### Requirement 10: Quick Links — Remove

**User Story:** As a user, I want to remove saved links I no longer need, so that the Quick Links panel stays relevant.

#### Acceptance Criteria

1. THE Quick_Links widget SHALL display a remove control (×) alongside each saved Link button.
2. WHEN the user activates the remove control of a Link, THE Quick_Links widget SHALL immediately remove that Link from the displayed list and save the updated link list to Local_Storage.
3. WHEN all links are removed, THE Quick_Links widget SHALL display an empty link list with no error state.
4. IF saving the updated link list to Local_Storage fails, THEN THE Quick_Links widget SHALL retain the removal in the displayed list and display an error message indicating that the change could not be saved persistently.

---

### Requirement 11: Light / Dark Mode Toggle

**User Story:** As a user, I want to switch between a light and a dark color scheme, so that the Dashboard is comfortable to use in different lighting conditions.

#### Acceptance Criteria

1. THE Dashboard SHALL provide a toggle control that visually reflects the current Theme (e.g., a sun/moon icon) and switches the Theme between "light" and "dark" modes when activated.
2. WHEN the user activates the theme toggle, THE Dashboard SHALL apply the selected Theme to the entire page within 100ms, with no page reload required.
3. WHEN the user activates the theme toggle, THE Dashboard SHALL save the selected Theme value to Local_Storage under the key `theme`.
4. WHEN the Dashboard page loads, THE Dashboard SHALL read the Theme from Local_Storage and apply it before rendering visible page content, so that no flash of the incorrect theme is observable.
5. IF Local_Storage does not contain a Theme entry, THEN THE Dashboard SHALL apply the "light" theme as the default.
6. WHILE the "dark" Theme is active, THE Dashboard SHALL apply a dark background color and light text color across all cards, widgets, inputs, and buttons to maintain a WCAG AA contrast ratio of at least 4.5:1 for body text.
7. WHILE the "light" Theme is active, THE Dashboard SHALL apply a white or light card background and dark text color across all cards, widgets, inputs, and buttons.

---

### Requirement 12: Data Persistence and Technical Constraints

**User Story:** As a user, I want my preferences and data to survive page reloads, so that I do not have to re-enter information every session.

#### Acceptance Criteria

1. THE Dashboard SHALL use only the browser's Local Storage API for all data persistence; no backend server, database, or cookie is required.
2. THE Dashboard SHALL be implemented using HTML, CSS, and Vanilla JavaScript only, with no external frameworks or libraries.
3. THE Dashboard SHALL function when opened as a local file (using a `file://` protocol URL) in Chrome, Firefox, Edge, and Safari, such that all widgets render, Local Storage read and write operations complete without error, and no JavaScript exceptions are thrown due to protocol restrictions.
4. WHEN the Dashboard page is opened or reloaded, THE Dashboard SHALL load and render all widgets within 2 seconds on a modern desktop machine, with no widget placeholder or blank container visible after that time.
5. THE Dashboard SHALL use a single CSS file located at `css/styles.css` and a single JavaScript file located at `js/app.js`.
6. IF the browser's Local Storage API is unavailable or a write operation fails due to storage quota being exceeded, THEN THE Dashboard SHALL display an error message indicating that data cannot be saved and continue to function for the current session using in-memory state without data loss within that session.

---

### Requirement 13: Visual Layout and Design

**User Story:** As a user, I want a clean and visually organized dashboard, so that I can find information and controls at a glance without confusion.

#### Acceptance Criteria

1. THE Dashboard SHALL display the Clock and Greeting in a full-width header card at the top of the page.
2. THE Dashboard SHALL display the Timer widget and the Task_Manager widget side by side in a middle row below the header.
3. THE Dashboard SHALL display the Quick_Links widget in a card below the middle row.
4. THE Dashboard SHALL use a purple-to-violet gradient as the page background.
5. THE Dashboard SHALL display each widget inside a white card with rounded corners.
6. THE Dashboard SHALL use a sans-serif typeface throughout, with a minimum font size of 14px and a text-to-background contrast ratio of at least 4.5:1 for all body text.
7. IF the viewport width is below 768px, THEN THE Dashboard SHALL stack all cards vertically in a single column.
