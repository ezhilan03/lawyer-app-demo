"use strict";
(function () {
  const M = WorkflowModel,
    KEY = "firm-workflow-v3";
  let data = M.make();
  try {
    data = M.restore(localStorage.getItem(KEY));
  } catch {}
  let personas = { client: "C1", lawyer: "L1", admin: "ADMIN" },
    chosen = {},
    notice = "",
    pendingImport = null,
    bootstrapAttempted = false,
    intake = { reason: "", notes: "" };
  const T = (en, ta) => tr(en, ta),
    E = (x) => escapeHTML(String(x ?? ""));
  const actor = () => ({
    role: role === "public" ? "client" : role,
    id: personas[role === "public" ? "client" : role],
  });
  const refreshWF = () => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) data = M.restore(raw);
    } catch {}
  };
  const saveWF = () => {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch {
      notice = T(
        "Browser storage is unavailable. Changes last for this page only.",
        "உலாவிச் சேமிப்பு கிடைக்கவில்லை. மாற்றங்கள் இந்தப் பக்கத்தில் மட்டுமே இருக்கும்.",
      );
    }
  };
  const names = (id) => {
    const x = [...data.clients, ...data.lawyers].find((x) => x.id === id);
    return x
      ? E(lang === "ta" ? x.nameTa || x.name : x.name)
      : id === "ADMIN"
        ? T("Firm Admin", "நிறுவன நிர்வாகி")
        : T("Not assigned", "இன்னும் ஒதுக்கப்படவில்லை");
  };
  const slotLabel = (n) =>
    [
      T("6 Oct · 10:00 AM", "அக். 6 · காலை 10 மணி"),
      T("7 Oct · 2:30 PM", "அக். 7 · பிற்பகல் 2:30 மணி"),
      T("8 Oct · 11:00 AM", "அக். 8 · காலை 11 மணி"),
      T("9 Oct · 10:00 AM", "அக். 9 · காலை 10 மணி"),
    ][n] || T("Not set", "குறிப்பிடப்படவில்லை");
  const states = {
    requested: ["Awaiting assignment", "ஒதுக்கீட்டிற்காகக் காத்திருக்கிறது"],
    awaiting_payment: [
      "Assigned · sample payment pending",
      "ஒதுக்கப்பட்டது · மாதிரிக் கட்டணம் நிலுவை",
    ],
    confirmed: ["Confirmed", "உறுதிசெய்யப்பட்டது"],
    reschedule_requested: [
      "Time change requested",
      "நேர மாற்றம் கோரப்பட்டுள்ளது",
    ],
    in_progress: ["In progress", "நடைபெறுகிறது"],
    completed: [
      "Completed · outcome submitted",
      "முடிந்தது · முடிவு சமர்ப்பிக்கப்பட்டது",
    ],
    followup: ["Follow-up required", "தொடர் பணி தேவை"],
    closed: ["Closed", "முடிக்கப்பட்டது"],
    cancelled: ["Cancelled", "ரத்து செய்யப்பட்டது"],
  };
  const eventNames = {
    decline_reschedule: [
      "Time change declined; original appointment kept",
      "நேர மாற்றம் மறுக்கப்பட்டது; முந்தைய சந்திப்பு தொடர்கிறது",
    ],
    withdraw_reschedule: [
      "Time change withdrawn; original appointment kept",
      "நேர மாற்றக் கோரிக்கை திரும்பப் பெறப்பட்டது; முந்தைய சந்திப்பு தொடர்கிறது",
    ],
    resolve_followup: [
      "Follow-up resolution recorded",
      "தொடர் பணி நிறைவு பதிவானது",
    ],
    followup_request: [
      "Linked follow-up request created",
      "இணைக்கப்பட்ட தொடர் ஆலோசனைக் கோரிக்கை உருவானது",
    ],
    requested: ["Request received", "கோரிக்கை பெறப்பட்டது"],
    assigned: ["Lawyer assigned", "வழக்கறிஞர் ஒதுக்கப்பட்டார்"],
    assign: ["Assignment updated", "ஒதுக்கீடு புதுப்பிக்கப்பட்டது"],
    sample_payment: ["Sample payment recorded", "மாதிரிக் கட்டணம் பதிவானது"],
    pay: ["Sample payment recorded", "மாதிரிக் கட்டணம் பதிவானது"],
    reschedule: ["Time change requested", "நேர மாற்றம் கோரப்பட்டது"],
    approve_reschedule: [
      "New time confirmed",
      "புதிய நேரம் உறுதிசெய்யப்பட்டது",
    ],
    cancel: ["Request cancelled", "கோரிக்கை ரத்து செய்யப்பட்டது"],
    meeting: [
      "Meeting details updated",
      "சந்திப்பு விவரங்கள் புதுப்பிக்கப்பட்டன",
    ],
    doc_request: ["Document requested", "ஆவணம் கேட்கப்பட்டது"],
    doc_add: ["Sample document added", "மாதிரி ஆவணம் சேர்க்கப்பட்டது"],
    doc_replace: ["Sample version replaced", "மாதிரிப் பதிப்பு மாற்றப்பட்டது"],
    doc_remove: ["Sample document removed", "மாதிரி ஆவணம் நீக்கப்பட்டது"],
    doc_review: ["Document reviewed", "ஆவணம் ஆய்வு செய்யப்பட்டது"],
    message: ["Message added", "செய்தி சேர்க்கப்பட்டது"],
    start: ["Consultation started", "ஆலோசனை தொடங்கியது"],
    complete: [
      "Outcome submitted to admin",
      "முடிவு நிர்வாகியிடம் சமர்ப்பிக்கப்பட்டது",
    ],
    publish: ["Client summary shared", "வாடிக்கையாளர் சுருக்கம் பகிரப்பட்டது"],
    followup: ["Follow-up proposed", "தொடர் பணி முன்மொழியப்பட்டது"],
    close: ["Consultation closed", "ஆலோசனை முடிக்கப்பட்டது"],
    closed: ["Consultation closed", "ஆலோசனை முடிக்கப்பட்டது"],
    reopen: ["Consultation reopened", "ஆலோசனை மீண்டும் திறக்கப்பட்டது"],
  };
  const errors = {
    followup_open: [
      "Resolve the follow-up with a note before closing.",
      "முடிக்கும் முன் குறிப்புடன் தொடர் பணியை நிறைவு செய்யுங்கள்.",
    ],
    duplicate: [
      "An equivalent active request already exists. Open it from the list.",
      "இதே போன்ற செயலில் உள்ள கோரிக்கை ஏற்கெனவே உள்ளது. பட்டியலிலிருந்து அதைத் திறக்கவும்.",
    ],
    client_collision: [
      "This client already has a reserved consultation at that time. Choose another time.",
      "இந்த வாடிக்கையாளருக்கு அந்த நேரத்தில் ஏற்கெனவே சந்திப்பு ஒதுக்கப்பட்டுள்ளது. வேறு நேரத்தைத் தேர்ந்தெடுங்கள்.",
    ],
    forbidden: [
      "This action is not available for the selected demo profile.",
      "தேர்ந்தெடுத்த மாதிரிக் கணக்கிற்கு இந்தச் செயல் கிடைக்காது.",
    ],
    invalid: [
      "Choose valid sample details.",
      "சரியான மாதிரி விவரங்களைத் தேர்ந்தெடுங்கள்.",
    ],
    intake: [
      "Add a consultation reason and choose the service, time, format and language.",
      "ஆலோசனைக்கான காரணத்தைக் குறிப்பிட்டு சேவை, நேரம், சந்திப்பு முறை, மொழியைத் தேர்ந்தெடுங்கள்.",
    ],
    profile: [
      "Use a sample name and an @example.invalid email address.",
      "மாதிரிப் பெயரையும் @example.invalid மின்னஞ்சல் முகவரியையும் பயன்படுத்துங்கள்.",
    ],
    reserved: [
      "This time is reserved. Reassign or cancel the appointment before changing availability.",
      "இந்த நேரம் ஒதுக்கப்பட்டுள்ளது. நேரத்தை மாற்றும் முன் சந்திப்பை வேறு வழக்கறிஞருக்கு ஒதுக்கவும் அல்லது ரத்து செய்யவும்.",
    ],
    collision: [
      "The lawyer is unavailable or already reserved at that time. Choose another lawyer or time.",
      "இந்த நேரத்தில் வழக்கறிஞர் கிடைக்கவில்லை அல்லது வேறு சந்திப்பு உள்ளது. வேறு வழக்கறிஞரை அல்லது நேரத்தைத் தேர்ந்தெடுங்கள்.",
    ],
    specialism: [
      "Choose a lawyer who handles this service.",
      "இந்தச் சேவையைக் கையாளும் வழக்கறிஞரைத் தேர்ந்தெடுங்கள்.",
    ],
    transition: [
      "This action is not available at the current stage.",
      "தற்போதைய நிலையில் இந்தச் செயலைச் செய்ய முடியாது.",
    ],
    outcome: [
      "Start the consultation first, then enter an outcome and 1–480 sample minutes.",
      "முதலில் ஆலோசனையைத் தொடங்கி, முடிவையும் 1–480 மாதிரி நிமிடங்களையும் குறிப்பிடுங்கள்.",
    ],
  };
  const B = (label, type, c = "", value = "", secondary = false) =>
    `<button class="btn ${secondary ? "outline" : ""}" type="button" data-wf="${type}" data-case="${E(c)}" data-value="${E(value)}">${label}</button>`;
  const options = (list, val) =>
    list
      .map(
        ([id, label]) =>
          `<option value="${E(id)}" ${String(id) === String(val) ? "selected" : ""}>${label}</option>`,
      )
      .join("");
  const slotOptions = (value) =>
    options(
      M.slots.map((_, i) => [i, slotLabel(i)]),
      value,
    );
  const field = (name, label, input) =>
    `<label class="wf-field"><span>${label}</span>${input}</label>`;
  const textarea = (name, label, value = "", required = false) =>
    field(
      name,
      label,
      `<textarea name="${name}" rows="3" maxlength="1200" ${required ? "required" : ""}>${E(value)}</textarea>`,
    );
  const select = (name, label, opts) =>
    field(name, label, `<select name="${name}">${opts}</select>`);
  const form = (type, c, body, label) =>
    `<form class="wf-form" data-wf-form="${type}" data-case="${E(c || "")}">${body}<button class="btn" type="submit">${label}</button></form>`;
  const badge = (c) =>
    `<span class="wf-status">${T(...states[c.status])}</span>`;
  function selection() {
    const cases = M.project(data, actor());
    let c = cases.find((x) => x.id === chosen[role]);
    if (!c) c = cases[0];
    return { cases, c };
  }
  function header() {
    const a = actor(),
      people =
        a.role === "client"
          ? data.clients
          : a.role === "lawyer"
            ? data.lawyers
            : [];
    return `<div class="wf-context">${
      people.length
        ? field(
            "persona",
            T("Sample profile", "மாதிரிக் கணக்கு"),
            `<select data-wf-persona>${options(
              people.filter((p) => p.active).map((p) => [p.id, names(p.id)]),
              a.id,
            )}</select>`,
          )
        : `<span class="small">${T("Firm Admin · sample workspace", "நிறுவன நிர்வாகி · மாதிரிப் பணியிடம்")}</span>`
    }${alertButton()}</div>${notice ? `<div class="wf-notice" role="status">${E(notice)}</div>` : ""}`;
  }

  function caseIndex(cases, c) {
    return `<div class="wf-case-index"><div class="wf-section-title"><h2>${T("Consultations", "ஆலோசனைகள்")}</h2>${role === "client" ? B(T("New request", "புதிய கோரிக்கை"), "new") : ""}</div>${cases.length ? `<div class="wf-case-list">${cases.map((x) => `<button type="button" data-wf="select" data-case="${x.id}" aria-pressed="${c?.id === x.id}"><span>${x.id} · ${serviceName(x.service)}</span>${badge(x)}<small>${slotLabel(x.slot)} · ${names(x.client)}</small></button>`).join("")}</div>` : `<div class="empty">${T("No consultations are assigned to this profile. Choose another sample profile or create a request.", "இந்தக் கணக்கிற்கு ஆலோசனைகள் இல்லை. வேறு மாதிரிக் கணக்கைத் தேர்ந்தெடுக்கலாம் அல்லது புதிய கோரிக்கை அளிக்கலாம்.")}</div>`}</div>`;
  }
  function casePicker(cases, c) {
    if (!c)
      return `<div class="empty">${T("No consultations are available for this profile.", "இந்தக் கணக்கிற்கு ஆலோசனைகள் எதுவும் இல்லை.")}</div>`;
    return `<div class="wf-case-picker">${field(
      "consultation",
      T("Selected consultation", "தேர்ந்தெடுக்கப்பட்ட ஆலோசனை"),
      `<select data-wf-case>${options(
        cases.map((x) => [
          x.id,
          `${x.id} · ${serviceName(x.service)} · ${slotLabel(x.slot)}`,
        ]),
        c.id,
      )}</select>`,
    )}</div>`;
  }
  function intakeForm() {
    return `<section class="wf-panel"><h2>${T("Request a consultation", "ஆலோசனையைக் கோருங்கள்")}</h2><p>${T("Use synthetic details only. This creates another local consultation without replacing earlier records.", "கற்பனை விவரங்களை மட்டும் பயன்படுத்துங்கள். முந்தைய பதிவுகளை மாற்றாமல் புதிய உள்ளூர் ஆலோசனை உருவாகும்.")}</p>${form(
      "submit",
      "",
      `<div class="wf-fields">${select(
        "service",
        T("Service", "சேவை"),
        options(
          M.services.map((x) => [x, serviceName(x)]),
          "property",
        ),
      )}${select("slot", T("Preferred time · India time", "விருப்ப நேரம் · இந்திய நேரம்"), slotOptions(0))}${select(
        "format",
        T("Meeting format", "சந்திப்பு முறை"),
        options(
          ["office", "video", "phone"].map((x) => [x, formatName(x)]),
          "office",
        ),
      )}${select(
        "language",
        T("Consultation language", "ஆலோசனை மொழி"),
        options(
          [
            ["ta", "தமிழ்"],
            ["en", "English"],
          ],
          "ta",
        ),
      )}</div>${textarea("reason", T("Reason for consultation", "ஆலோசனைக்கான காரணம்"), "", true)}${textarea("notes", T("Additional notes · optional", "கூடுதல் குறிப்புகள் · விருப்பத்திற்குரியது"))}`,
      T("Create sample request", "மாதிரிக் கோரிக்கையை உருவாக்கு"),
    )}</section>`;
  }
  function nextAction(c) {
    if (role === "client") {
      if (c.status === "requested")
        return T(
          "The office will review the request and assign a suitable lawyer.",
          "அலுவலகம் கோரிக்கையை ஆய்வு செய்து பொருத்தமான வழக்கறிஞரை ஒதுக்கும்.",
        );
      if (c.status === "awaiting_payment")
        return T(
          "Review the illustrative fee before simulating payment. No charge is made.",
          "மாதிரிக் கட்டணத்தைப் பார்த்த பிறகு கட்டணம் செலுத்துவதை முயற்சிக்கலாம். உண்மையான கட்டணம் இல்லை.",
        );
      if (c.status === "confirmed")
        return T(
          "Prepare requested documents and check meeting details.",
          "கேட்கப்பட்ட ஆவணங்களைத் தயார்செய்து சந்திப்பு விவரங்களைப் பாருங்கள்.",
        );
      if (c.status === "completed" && !c.report)
        return T(
          "The consultation is complete. The lawyer has not shared the client summary yet.",
          "ஆலோசனை முடிந்தது. வழக்கறிஞர் வாடிக்கையாளர் சுருக்கத்தை இன்னும் பகிரவில்லை.",
        );
      if (c.status === "followup")
        return T(
          "Review the proposed follow-up. It is not a reserved or paid appointment.",
          "முன்மொழியப்பட்ட தொடர் பணியைப் பாருங்கள். இது உறுதிசெய்யப்பட்ட அல்லது கட்டணம் செலுத்திய சந்திப்பு அல்ல.",
        );
    }
    if (role === "lawyer") {
      if (c.status === "confirmed")
        return T(
          "Review documents, then start the sample consultation.",
          "ஆவணங்களை ஆய்வு செய்த பிறகு மாதிரி ஆலோசனையைத் தொடங்குங்கள்.",
        );
      if (c.status === "in_progress")
        return T(
          "Record the outcome and sample duration for admin review.",
          "நிர்வாக ஆய்விற்காக முடிவையும் மாதிரிக் கால அளவையும் பதிவு செய்யுங்கள்.",
        );
      if (c.status === "completed")
        return T(
          "Share a client-safe summary and identify any follow-up.",
          "வாடிக்கையாளருக்கான சுருக்கத்தைப் பகிர்ந்து தேவையான தொடர் பணியைக் குறிப்பிடுங்கள்.",
        );
    }
    if (role === "admin") {
      if (c.status === "requested")
        return T(
          "Assign a suitable available lawyer before the sample payment step.",
          "மாதிரிக் கட்டணத்திற்கு முன் கிடைக்கும் பொருத்தமான வழக்கறிஞரை ஒதுக்குங்கள்.",
        );
      if (c.status === "completed" || c.status === "followup")
        return T(
          "Review the outcome and shared summary before closing the consultation.",
          "ஆலோசனையை முடிக்கும் முன் முடிவையும் பகிரப்பட்ட சுருக்கத்தையும் ஆய்வு செய்யுங்கள்.",
        );
    }
    return T(
      "Review the current details and activity below.",
      "கீழே உள்ள தற்போதைய விவரங்களையும் செயல்பாடுகளையும் பாருங்கள்.",
    );
  }
  function overview(c) {
    const p = data.clients.find((x) => x.id === c.client);
    return `<section class="wf-panel"><div class="wf-section-title"><div><p class="small">${c.id} · ${names(c.client)}${c.parentId ? " · " + T("Follow-up to", "முந்தைய ஆலோசனை") + " " + E(c.parentId) : ""}</p><h2>${serviceName(c.service)}</h2></div>${badge(c)}</div><dl class="wf-details"><div><dt>${T("Appointment · India time", "சந்திப்பு · இந்திய நேரம்")}</dt><dd>${slotLabel(c.slot)}</dd></div><div><dt>${T("Assigned lawyer", "ஒதுக்கப்பட்ட வழக்கறிஞர்")}</dt><dd>${names(c.lawyer)}</dd></div><div><dt>${T("Format / language", "முறை / மொழி")}</dt><dd>${formatName(c.format)} / ${c.language === "ta" ? "தமிழ்" : "English"}</dd></div><div><dt>${T("Client contact · synthetic", "வாடிக்கையாளர் தொடர்பு · மாதிரி")}</dt><dd>${E(p.email)}</dd></div></dl><h3>${T("Consultation reason", "ஆலோசனைக்கான காரணம்")}</h3><p>${E(lang === "ta" && c.reasonTa ? c.reasonTa : c.reason)}</p>${c.sharedContext ? `<div class="wf-notice"><strong>${T("Shared preparation context", "பகிரப்பட்ட தயாரிப்பு விவரம்")}</strong><p>${E(c.sharedContext)}</p></div>` : ""}${c.notes ? `<p>${E(lang === "ta" && c.notesTa ? c.notesTa : c.notes)}</p>` : ""}<div class="wf-meeting"><h3>${T("Meeting details", "சந்திப்பு விவரங்கள்")}</h3><p>${c.meeting ? (c.meeting === "video_sample" ? T("Sample Google Meet room prepared. No real meeting link is generated.", "மாதிரி Google Meet அறை தயார். உண்மையான சந்திப்பு இணைப்பு உருவாக்கப்படவில்லை.") : c.meeting === "phone_sample" ? T("Sample phone consultation. The firm’s real support number is pending.", "மாதிரி தொலைபேசி ஆலோசனை. நிறுவனத்தின் உண்மையான தொடர்பு எண் நிலுவையில் உள்ளது.") : T("Sample office appointment. Address will be confirmed by the firm.", "மாதிரி அலுவலகச் சந்திப்பு. முகவரியை நிறுவனம் உறுதிசெய்யும்.")) : T("The office has not added meeting details yet.", "அலுவலகம் சந்திப்பு விவரங்களை இன்னும் சேர்க்கவில்லை.")}</p><small>${T("One-day reminders are planned, not sent by this demo.", "முந்தைய நாள் நினைவூட்டல் முன்மொழியப்பட்டுள்ளது; இந்த மாதிரியில் அனுப்பப்படாது.")}</small></div>${c.pendingSlot !== null ? `<div class="wf-notice">${T("Requested new time:", "கோரப்பட்ட புதிய நேரம்:")} ${slotLabel(c.pendingSlot)}</div>` : ""}${role === "admin" && c.followup ? `<div class="wf-notice"><strong>${c.followup.resolved ? T("Follow-up resolved", "தொடர் பணி நிறைவடைந்தது") : T("Proposed follow-up", "முன்மொழியப்பட்ட தொடர் பணி")}</strong><p>${E(c.followup.text)} · ${slotLabel(c.followup.slot)}</p>${c.followup.resolution ? `<p>${E(c.followup.resolution.text)}</p>` : ""}<small>${T("Not reserved. Timing and any fee require firm confirmation.", "நேரம் ஒதுக்கப்படவில்லை. நேரத்தையும் கட்டணத்தையும் நிறுவனம் உறுதிசெய்ய வேண்டும்.")}</small></div>` : ""}${controls(c)}</section>`;
  }
  function controls(c) {
    if (role === "client")
      return `<div class="wf-actions">${page === "compliance" && c.status === "followup" && c.followup && !c.followup.resolved ? B(T("Request linked follow-up consultation", "இணைக்கப்பட்ட தொடர் ஆலோசனையைக் கோரு"), "followup_request", c.id) : ""}${c.status === "awaiting_payment" ? B(T("Simulate payment · no charge", "மாதிரிக் கட்டணம் · உண்மையான கட்டணம் இல்லை"), "pay", c.id) : ""}${c.status === "reschedule_requested" ? B(T("Withdraw time change", "நேர மாற்றக் கோரிக்கையைத் திரும்பப் பெறு"), "withdraw_reschedule", c.id, "", true) : ""}${c.status === "confirmed" ? form("reschedule", c.id, select("slot", T("Request another time", "வேறு நேரம் கோருங்கள்"), slotOptions((c.slot + 1) % 4)), T("Request time change", "நேர மாற்றத்தைக் கோரு")) : ""}${["requested", "awaiting_payment", "confirmed", "reschedule_requested"].includes(c.status) ? `<details><summary>${T("Cancel this sample consultation", "இந்த மாதிரி ஆலோசனையை ரத்து செய்")}</summary><p>${T("No real refund is processed. Cancellation and refund policy remain pending.", "உண்மையான பணத்திருப்பம் இல்லை. ரத்து மற்றும் பணத்திருப்பக் கொள்கைகள் நிலுவையில் உள்ளன.")}</p>${B(T("Confirm sample cancellation", "மாதிரி ரத்தினை உறுதிசெய்"), "cancel", c.id, "", true)}</details>` : ""}</div>`;
    if (role === "admin")
      return `<div class="wf-actions">${
        [
          "requested",
          "awaiting_payment",
          "confirmed",
          "reschedule_requested",
        ].includes(c.status)
          ? form(
              "assign",
              c.id,
              select(
                "lawyer",
                T(
                  "Assign or reassign lawyer",
                  "வழக்கறிஞரை ஒதுக்கு அல்லது மாற்று",
                ),
                options(
                  data.lawyers
                    .filter((l) => l.active)
                    .map((l) => [
                      l.id,
                      `${names(l.id)} · ${M.available(data, l.id, c.slot, c.id) ? T("Available", "கிடைக்கிறார்") : T("Unavailable", "கிடைக்கவில்லை")}`,
                    ]),
                  c.lawyer || "L1",
                ),
              ),
              T("Save assignment", "ஒதுக்கீட்டைச் சேமி"),
            )
          : ""
      }${
        ["awaiting_payment", "confirmed", "reschedule_requested"].includes(
          c.status,
        )
          ? form(
              "meeting",
              c.id,
              select(
                "meeting",
                T("Sample meeting details", "மாதிரிச் சந்திப்பு விவரங்கள்"),
                options(
                  [
                    [
                      "office_sample",
                      T("Office appointment", "அலுவலகச் சந்திப்பு"),
                    ],
                    [
                      "video_sample",
                      T("Google Meet concept", "Google Meet மாதிரி"),
                    ],
                    [
                      "phone_sample",
                      T("Phone consultation", "தொலைபேசி ஆலோசனை"),
                    ],
                  ],
                  c.meeting || c.format + "_sample",
                ),
              ),
              T("Save meeting details", "சந்திப்பு விவரங்களைச் சேமி"),
            )
          : ""
      }${c.status === "reschedule_requested" ? B(T("Approve new time", "புதிய நேரத்தை உறுதிசெய்"), "approve_reschedule", c.id) + B(T("Keep original time", "முந்தைய நேரத்தைத் தொடரு"), "decline_reschedule", c.id, "", true) : ""}${c.status === "followup" && c.followup && !c.followup.resolved ? form("resolve_followup", c.id, textarea("text", T("Follow-up resolution note · demo rule pending firm approval", "தொடர் பணி நிறைவுக் குறிப்பு · நிறுவன ஒப்புதல் தேவைப்படும் மாதிரி விதி"), "", true), T("Record follow-up resolution", "தொடர் பணி நிறைவைப் பதிவு செய்")) : ""}${["completed", "followup"].includes(c.status) ? (c.report ? B(T("Close consultation", "ஆலோசனையை முடி"), "close", c.id) : `<p>${T("A client summary must be shared before closure.", "முடிக்கும் முன் வாடிக்கையாளர் சுருக்கம் பகிரப்பட வேண்டும்.")}</p>`) : ""}${c.status === "closed" ? B(T("Reopen for follow-up", "தொடர் பணிக்காக மீண்டும் திற"), "reopen", c.id) : ""}</div>`;
    return `<div class="wf-actions">${c.status === "confirmed" ? B(T("Start consultation", "ஆலோசனையைத் தொடங்கு"), "start", c.id) : ""}${c.status === "in_progress" ? form("complete", c.id, textarea("outcome", T("Outcome for admin · internal until separately shared", "நிர்வாகிக்கான முடிவு · தனியாகப் பகிரும் வரை உள் பதிவு"), "", true) + field("minutes", T("Sample duration in minutes · no automatic bill", "மாதிரிக் கால அளவு · தானியங்கிக் கட்டணம் இல்லை"), '<input type="number" name="minutes" min="1" max="480" value="30" required>'), T("Complete and submit outcome", "முடித்து விவரத்தைச் சமர்ப்பி")) : ""}${page === "followups" && ["completed", "followup"].includes(c.status) ? form("publish", c.id, textarea("text", T("Client-visible consultation summary", "வாடிக்கையாளருக்குத் தெரியும் ஆலோசனைச் சுருக்கம்"), c.report?.text || "", true), T("Share summary with client", "சுருக்கத்தை வாடிக்கையாளருடன் பகிர்")) : ""}${page === "followups" && c.status === "completed" ? form("followup", c.id, textarea("text", T("Proposed follow-up action", "முன்மொழியப்படும் தொடர் பணி"), "", true) + select("slot", T("Proposed next appointment · not reserved", "அடுத்த சந்திப்பு முன்மொழிவு · நேரம் ஒதுக்கப்படவில்லை"), slotOptions((c.slot + 1) % 4)), T("Submit follow-up", "தொடர் பணியைச் சமர்ப்பி")) : ""}</div>`;
  }
  function documents(c) {
    const canEdit =
      role === "client" &&
      [
        "requested",
        "awaiting_payment",
        "confirmed",
        "reschedule_requested",
      ].includes(c.status);
    return `<section class="wf-panel"><h2>${T("Documents for this consultation", "இந்த ஆலோசனைக்கான ஆவணங்கள்")}</h2><p>${T("Synthetic document records only. No files are selected, stored or transmitted. Version history and review refer to sample records.", "மாதிரி ஆவணப் பதிவுகள் மட்டுமே. கோப்புகள் தேர்ந்தெடுக்கப்படவோ சேமிக்கப்படவோ அனுப்பப்படவோ மாட்டாது. பதிப்பு வரலாறும் ஆய்வும் மாதிரிப் பதிவுகளைக் குறிக்கும்.")}</p>${c.documents.length ? c.documents.map((d) => `<article class="wf-document"><div><h3>${E(lang === "ta" && d.labelTa ? d.labelTa : d.label)}</h3><p>${d.removed ? T("Removed from active documents", "செயலில் உள்ள ஆவணங்களிலிருந்து நீக்கப்பட்டது") : d.version ? `${T("Sample version", "மாதிரிப் பதிப்பு")} ${d.version}` : T("Requested · no sample added", "கேட்கப்பட்டது · மாதிரி இன்னும் சேர்க்கப்படவில்லை")}</p>${d.reviewedBy ? `<small>${T("Reviewed by", "ஆய்வு செய்தவர்")} ${names(d.reviewedBy)} · ${T("version", "பதிப்பு")} ${d.reviewedVersion}</small>` : ""}<details><summary>${T("Version history", "பதிப்பு வரலாறு")}</summary><p>${d.versions.length ? d.versions.map((v) => `${T("Version", "பதிப்பு")} ${v.version} · ${names(v.addedBy)}`).join("<br>") : T("No versions yet.", "இன்னும் பதிப்புகள் இல்லை.")}</p></details></div><div class="wf-actions">${canEdit || (role === "client" && c.status === "followup" && !d.version) ? (!d.version || d.removed ? B(T("Add sample", "மாதிரியைச் சேர்"), "doc_add", c.id, d.id) : `${B(T("Replace sample version", "மாதிரிப் பதிப்பை மாற்று"), "doc_replace", c.id, d.id, true)}${B(T("Remove sample", "மாதிரியை நீக்கு"), "doc_remove", c.id, d.id, true)}`) : ""}${role === "lawyer" && d.version && !d.removed && ["confirmed", "in_progress", "completed", "followup"].includes(c.status) ? B(T("Mark current version reviewed", "தற்போதைய பதிப்பை ஆய்வு செய்ததாகக் குறி"), "doc_review", c.id, d.id, true) : ""}</div></article>`).join("") : `<div class="empty">${T("No document records yet.", "இன்னும் ஆவணப் பதிவுகள் இல்லை.")}</div>`}${canEdit ? B(T("Add another sample document", "மேலும் ஒரு மாதிரி ஆவணத்தைச் சேர்"), "doc_add", c.id) : ""}${["lawyer", "admin"].includes(role) && ["requested", "awaiting_payment", "confirmed", "in_progress", "followup"].includes(c.status) ? form("doc_request", c.id, field("label", T("Document request", "தேவையான ஆவணம்"), `<input name="label" maxlength="100" required placeholder="${T("For example: agreement draft", "உதாரணம்: ஒப்பந்த வரைவு")}">`), T("Request document", "ஆவணத்தைக் கோரு")) : ""}${!canEdit && role === "client" ? `<p class="small">${T("Sample changes are available before the consultation starts. Requested follow-up documents can also be added; earlier reviewed versions stay in the history.", "ஆலோசனை தொடங்கும் முன் மாதிரிகளை மாற்றலாம். தொடர் பணிக்காகக் கேட்கப்பட்ட ஆவணங்களையும் சேர்க்கலாம்; முந்தைய ஆய்வுப் பதிப்புகள் வரலாற்றில் இருக்கும்.")}</p>` : ""}</section>`;
  }
  function messages(c) {
    return `<section class="wf-panel"><h2>${role === "client" ? T("Messages with the firm", "நிறுவனத்துடனான செய்திகள்") : T("Client messages and internal notes", "வாடிக்கையாளர் செய்திகளும் உள் குறிப்புகளும்")}</h2><p class="small">${T("Local demonstration only. Nothing is sent outside this browser.", "உள்ளூர் செயல்விளக்கம் மட்டுமே. இந்த உலாவிக்கு வெளியே எதுவும் அனுப்பப்படாது.")}</p>${c.messages.length ? c.messages.map((m) => `<article class="wf-message ${m.visibility === "internal" ? "wf-internal" : ""}"><small>${names(m.author)} · ${m.visibility === "internal" ? T("Internal · lawyer and admin only", "உள் பதிவு · வழக்கறிஞர் மற்றும் நிர்வாகிக்கு மட்டும்") : T("Visible to client", "வாடிக்கையாளருக்குத் தெரியும்")}</small><p>${E(lang === "ta" && m.textTa ? m.textTa : m.text)}</p></article>`).join("") : `<p>${T("No messages yet.", "இன்னும் செய்திகள் இல்லை.")}</p>`}${
      !["closed", "cancelled"].includes(c.status)
        ? form(
            "message",
            c.id,
            (role === "client"
              ? '<input type="hidden" name="visibility" value="client">'
              : select(
                  "visibility",
                  T(
                    "Who can see this note?",
                    "இந்தக் குறிப்பை யார் பார்க்கலாம்?",
                  ),
                  options(
                    [
                      [
                        "client",
                        T(
                          "Client, assigned lawyer and admin",
                          "வாடிக்கையாளர், ஒதுக்கப்பட்ட வழக்கறிஞர், நிர்வாகி",
                        ),
                      ],
                      [
                        "internal",
                        T(
                          "Assigned lawyer and admin only",
                          "ஒதுக்கப்பட்ட வழக்கறிஞர் மற்றும் நிர்வாகிக்கு மட்டும்",
                        ),
                      ],
                    ],
                    "client",
                  ),
                )) +
              textarea(
                "text",
                T("Sample message", "மாதிரிச் செய்தி"),
                "",
                true,
              ),
            T("Add local message", "உள்ளூர் செய்தியைச் சேர்"),
          )
        : ""
    }</section>`;
  }
  function reports(c) {
    return `<section class="wf-panel"><h2>${T("Consultation summary", "ஆலோசனைச் சுருக்கம்")}</h2>${c.reportHistory?.length ? `<details><summary>${T("Earlier shared versions", "முன்பு பகிரப்பட்ட பதிப்புகள்")} (${c.reportHistory.length})</summary>${c.reportHistory.map((v, i) => `<p>${T("Version", "பதிப்பு")} ${i + 1}: ${E(lang === "ta" && v.textTa ? v.textTa : v.text)}</p>`).join("")}</details>` : ""}${c.report ? `<article class="report-paper"><p>${E(lang === "ta" && c.report.textTa ? c.report.textTa : c.report.text)}</p><small>${T("Shared by", "பகிர்ந்தவர்")} ${names(c.report.author)} · ${T("Sample only; not legal advice.", "மாதிரி மட்டுமே; சட்ட ஆலோசனை அல்ல.")}</small><p><a class="btn outline" href="data:text/plain;charset=utf-8,${encodeURIComponent(T("SAMPLE SUMMARY · Not legal advice\n\n", "மாதிரிச் சுருக்கம் · சட்ட ஆலோசனை அல்ல\n\n") + (lang === "ta" && c.report.textTa ? c.report.textTa : c.report.text))}" download="${c.id}-sample-summary.txt">${T("Download sample summary", "மாதிரிச் சுருக்கத்தைப் பதிவிறக்கு")}</a></p></article>` : `<div class="empty">${T("The lawyer has not shared a client summary yet.", "வழக்கறிஞர் வாடிக்கையாளர் சுருக்கத்தை இன்னும் பகிரவில்லை.")}</div>`}</section>`;
  }
  function fees(c) {
    return `<section class="wf-panel"><h2>${T("Sample payment record", "மாதிரிக் கட்டணப் பதிவு")}</h2><p><strong>₹${c.fee.amount} INR</strong> · ${c.fee.status === "sample_paid" ? T("Simulated payment recorded", "மாதிரிக் கட்டணம் பதிவானது") : c.fee.status === "sample_due" ? T("Illustrative payment pending", "மாதிரிக் கட்டணம் நிலுவை") : T("Not requested", "இன்னும் கோரப்படவில்லை")}</p><p class="small">${T("Illustrative amount only. Fee authority, deposit/full payment, hourly reconciliation, supported currencies, refund rules and reservation expiry require firm decisions. No real charge or refund.", "விளக்கத்திற்கான தொகை மட்டுமே. கட்டண நிர்ணயம், முன்பணம் அல்லது முழுத் தொகை, மணிநேரக் கட்டணம், நாணயங்கள், பணத்திருப்பம், நேர ஒதுக்கீட்டின் காலவரம்பு ஆகியவற்றை நிறுவனம் முடிவு செய்ய வேண்டும். உண்மையான கட்டணமோ பணத்திருப்பமோ இல்லை.")}</p></section>`;
  }
  function trail(c) {
    return `<section class="wf-panel"><details><summary>${T("Consultation activity", "ஆலோசனைச் செயல்பாடுகள்")} (${c.events.length})</summary><ol class="wf-trail">${c.events.map((e) => `<li><span>${T(...(eventNames[e.type] || ["Record updated", "பதிவு புதுப்பிக்கப்பட்டது"]))}</span><small>${names(e.actor)} · ${e.id}${e.visibility === "internal" ? " · " + T("Internal", "உள் பதிவு") : ""}</small></li>`).join("")}</ol></details></section>`;
  }
  function availability() {
    const list =
      role === "lawyer"
        ? data.lawyers.filter((l) => l.id === actor().id)
        : data.lawyers;
    return `<section class="wf-panel"><h2>${T("Lawyer-managed availability", "வழக்கறிஞர் நிர்வகிக்கும் நேரங்கள்")}</h2><p>${T("Sample dates in India time. Existing reservations cannot be removed. Admin override and holiday policy are undecided.", "இந்திய நேரத்தில் மாதிரித் தேதிகள். ஏற்கெனவே ஒதுக்கப்பட்ட நேரங்களை நீக்க முடியாது. நிர்வாக மாற்றமும் விடுமுறைக் கொள்கையும் முடிவுசெய்யப்படவில்லை.")}</p>${list.map((l) => `<article class="wf-lawyer"><h3>${names(l.id)}</h3><p>${l.services.map(serviceName).join(" · ")}</p><div class="wf-slots">${M.slots.map((_, i) => (role === "lawyer" ? `<button class="btn outline" type="button" data-wf="availability" data-value="${i}" aria-pressed="${l.availability.includes(i)}">${slotLabel(i)}<small>${l.availability.includes(i) ? T("Offered", "கிடைக்கும்") : T("Unavailable", "கிடைக்காது")}</small></button>` : `<div>${slotLabel(i)}<small>${M.available(data, l.id, i) ? T("Available", "கிடைக்கிறார்") : T("Unavailable or reserved", "கிடைக்கவில்லை அல்லது ஒதுக்கப்பட்டுள்ளது")}</small></div>`)).join("")}</div></article>`).join("")}</section>`;
  }
  function profile() {
    const p = data.clients.find((x) => x.id === actor().id);
    return `<section class="wf-panel"><h2>${T("Sample profile", "மாதிரிக் கணக்கு விவரங்கள்")}</h2><p>${T("Use a fictional name and an @example.invalid address only. Mock phone verification is available on sign-in; changes stay in this browser.", "கற்பனைப் பெயரையும் @example.invalid முகவரியையும் மட்டும் பயன்படுத்துங்கள். உள்நுழைவில் மாதிரி தொலைபேசி சரிபார்ப்பு உள்ளது; மாற்றங்கள் இந்த உலாவியில் சேமிக்கப்படும்.")}</p>${form("profile", "", field("name", T("Sample name", "மாதிரிப் பெயர்"), `<input name="name" value="${E(p.name)}" maxlength="70" required>`) + field("email", T("Sample email", "மாதிரி மின்னஞ்சல்"), `<input type="email" name="email" value="${E(p.email)}" required>`) + field("phone", T("Contact number · sample", "தொடர்பு எண் · மாதிரி"), `<input name="phone" value="${E(p.phone === "Sample contact only" ? "0000000000" : p.phone || "0000000000")}" maxlength="20" required>`), T("Save sample profile", "மாதிரிக் கணக்கைச் சேமி"))}</section>`;
  }
  function metrics(cases) {
    const counts = [
      ["requested", T("Awaiting assignment", "ஒதுக்கீடு நிலுவை")],
      ["confirmed", T("Confirmed", "உறுதிசெய்யப்பட்டது")],
      ["in_progress", T("In progress", "நடைபெறுகிறது")],
      ["followup", T("Follow-up", "தொடர் பணி")],
    ];
    return `<div class="wf-metrics">${counts.map(([s, l]) => `<div><b>${cases.filter((c) => c.status === s).length}</b><span>${l}</span></div>`).join("")}</div><p class="small">${T("Counts reflect local sample records, not firm performance.", "எண்கள் உள்ளூர் மாதிரிப் பதிவுகளைக் குறிக்கும்; நிறுவனச் செயல்திறன் அல்ல.")}</p>`;
  }
  let mockDialog = null,
    otpChallenge = null,
    otpPerson = "C1",
    otpMessage = "",
    photoData = "";
  let readAlerts = [];
  try {
    readAlerts = JSON.parse(
      localStorage.getItem("firm-alerts-read-v1") || "[]",
    );
    if (!Array.isArray(readAlerts)) readAlerts = [];
  } catch {}
  let popup = "";
  const alertTypes = [
    "requested",
    "assign",
    "pay",
    "sample_payment",
    "publish",
    "followup",
    "approve_reschedule",
    "cancel",
    "closed",
  ];
  function alerts() {
    return M.project(data, actor())
      .flatMap((c) =>
        c.events
          .filter((e) => alertTypes.includes(e.type))
          .map((e) => ({ ...e, caseId: c.id, service: c.service })),
      )
      .sort((a, b) => Number(b.id.slice(1)) - Number(a.id.slice(1)));
  }
  function alertText(e) {
    return (
      {
        requested: T(
          "Booking request received. The office will confirm the appointment.",
          "முன்பதிவுக் கோரிக்கை பெறப்பட்டது. அலுவலகம் சந்திப்பை உறுதிசெய்யும்.",
        ),
        pay: T(
          "Booking confirmed. Your mock payment was successful.",
          "முன்பதிவு உறுதிசெய்யப்பட்டது. மாதிரிக் கட்டணம் வெற்றிகரமாகப் பதிவானது.",
        ),
        sample_payment: T(
          "Booking confirmed with a sample payment.",
          "மாதிரிக் கட்டணத்துடன் முன்பதிவு உறுதிசெய்யப்பட்டது.",
        ),
        assign: T(
          "A lawyer has been assigned. Review the next step.",
          "வழக்கறிஞர் ஒதுக்கப்பட்டுள்ளார். அடுத்த பணியைப் பாருங்கள்.",
        ),
        publish: T(
          "Your consultation summary is available.",
          "உங்கள் ஆலோசனைச் சுருக்கம் தயாராக உள்ளது.",
        ),
        followup: T(
          "A follow-up action has been added.",
          "தொடர் பணி சேர்க்கப்பட்டுள்ளது.",
        ),
        approve_reschedule: T(
          "Your new appointment time is confirmed.",
          "உங்கள் புதிய சந்திப்பு நேரம் உறுதிசெய்யப்பட்டது.",
        ),
        cancel: T("Consultation cancelled.", "ஆலோசனை ரத்துசெய்யப்பட்டது."),
        closed: T(
          "Consultation closed. Your history is retained.",
          "ஆலோசனை முடிக்கப்பட்டது. வரலாறு பாதுகாக்கப்பட்டுள்ளது.",
        ),
      }[e.type] || T("Consultation updated.", "ஆலோசனை புதுப்பிக்கப்பட்டது.")
    );
  }
  function alertButton() {
    const unread = alerts().filter(
      (e) => !readAlerts.includes(role + ":" + actor().id + ":" + e.id),
    ).length;
    return `<button class="btn outline" type="button" data-wf="notifications">${T("Notifications", "அறிவிப்புகள்")} (${unread})</button>`;
  }
  function photo(person) {
    return person.photo
      ? `<img class="wf-avatar" src="${E(person.photo)}" alt="${E(person.name)}">`
      : `<span class="wf-avatar" aria-hidden="true">${E(person.name.slice(0, 2).toUpperCase())}</span>`;
  }
  function management(kind) {
    const lawyer = kind === "lawyer",
      list = lawyer ? data.lawyers : data.clients;
    return `<section class="wf-panel"><div class="wf-section-title"><h2>${lawyer ? T("Lawyer directory", "வழக்கறிஞர் பட்டியல்") : T("Client directory", "வாடிக்கையாளர் பட்டியல்")}</h2><button class="btn" type="button" data-wf="edit_account" data-kind="${kind}">${lawyer ? T("Add lawyer", "வழக்கறிஞரைச் சேர்") : T("Add client", "வாடிக்கையாளரைச் சேர்")}</button></div><p>${T("Fictional accounts only. Deactivate instead of deleting history. Open work must be reassigned or closed first.", "கற்பனைக் கணக்குகள் மட்டும். வரலாற்றை நீக்காமல் கணக்கைச் செயலிழக்கச் செய்யலாம். நிலுவைப் பணிகளை முதலில் மாற்றி ஒதுக்கவும் அல்லது முடிக்கவும்.")}</p>${list.map((p) => `<article class="wf-task-row"><div class="wf-person">${photo(p)}<div><h3>${E(p.name)}</h3><p>${E(p.email || "lawyer" + p.id + "@example.invalid")} · ${E(p.phone || "0000000000")}</p><small>${p.active ? T("Active", "செயலில் உள்ளது") : T("Inactive", "செயலிழக்கப்பட்டது")}${lawyer ? " · " + p.services.map(serviceName).join(" · ") : ""}</small></div></div><button class="btn outline" type="button" data-wf="edit_account" data-kind="${kind}" data-person="${p.id}">${T("Edit", "திருத்து")}</button></article>`).join("")}${lawyer ? `<details><summary>${T("View team availability", "குழுவின் கிடைக்கும் நேரங்களைப் பார்")}</summary>${availability()}</details>` : ""}</section>`;
  }
  function editor() {
    const lawyer = mockDialog.accountRole === "lawyer";
    const p = (lawyer ? data.lawyers : data.clients).find(
      (x) => x.id === mockDialog.id,
    ) || {
      name: "",
      email: "",
      phone: "0000000000",
      services: ["property"],
      active: true,
    };
    return `<h2>${lawyer ? T("Lawyer details", "வழக்கறிஞர் விவரங்கள்") : T("Client details", "வாடிக்கையாளர் விவரங்கள்")}</h2><form data-account-form><div class="wf-fields">${field("name", T("Name", "பெயர்"), `<input name="name" maxlength="70" value="${E(p.name)}" required>`)}${field("email", T("Email · sample address", "மின்னஞ்சல் · மாதிரி முகவரி"), `<input type="email" name="email" value="${E(p.email || "")}" placeholder="name@example.invalid" required>`)}${field("phone", T("Contact number · sample", "தொடர்பு எண் · மாதிரி"), `<input name="phone" value="${E(p.phone || "0000000000")}" maxlength="20" required>`)}</div>${lawyer ? `<fieldset><legend>${T("Specializations", "சிறப்புப் பிரிவுகள்")}</legend>${M.services.map((x) => `<label class="wf-check"><input type="checkbox" name="services" value="${x}" ${p.services.includes(x) ? "checked" : ""}>${serviceName(x)}</label>`).join("")}</fieldset><label class="wf-field">${T("Profile photo · sample JPEG/PNG, up to 280 KB", "சுயவிவரப் படம் · மாதிரி JPEG/PNG, 280 KB வரை")}<input type="file" data-account-photo accept="image/png,image/jpeg"></label><div class="wf-photo-preview">${photo(p)}</div><label class="wf-check"><input type="checkbox" name="removePhoto">${T("Remove current photo", "தற்போதைய படத்தை நீக்கு")}</label>` : ""}<label class="wf-check"><input type="checkbox" name="active" ${p.active ? "checked" : ""}>${T("Account active", "கணக்கு செயலில் உள்ளது")}</label><p class="small">${T("Use fictional contact details and an @example.invalid email. Photos stay in this browser. New lawyers set their availability in the Lawyer journey.", "கற்பனைத் தொடர்பு விவரங்களையும் @example.invalid மின்னஞ்சலையும் பயன்படுத்துங்கள். படங்கள் இந்த உலாவியிலேயே இருக்கும். புதிய வழக்கறிஞர்கள் தங்கள் பணியிடத்தில் கிடைக்கும் நேரங்களைத் தேர்ந்தெடுக்கலாம்.")}</p><p class="wf-form-error" role="alert"></p><button class="btn" type="submit">${T("Save account", "கணக்கைச் சேமி")}</button></form>`;
  }
  function dialogHTML() {
    if (!mockDialog) return "";
    let content = "";
    if (mockDialog.kind === "account") content = editor();
    if (mockDialog.kind === "notifications")
      content = `<h2>${T("Notifications", "அறிவிப்புகள்")}</h2><p>${T("In-app demo alerts. No SMS, email or device push is sent.", "செயலிக்குள் மாதிரி அறிவிப்புகள். SMS, மின்னஞ்சல், சாதன அறிவிப்புகள் அனுப்பப்படாது.")}</p>${
        alerts()
          .map(
            (e) =>
              `<article class="wf-alert"><p>${E(e.caseId)} · ${alertText(e)}</p><button class="btn outline" type="button" data-wf="alert_open" data-case="${e.caseId}" data-event="${e.id}" data-event-type="${e.type}">${T("Open update", "தகவலைத் திற")}</button></article>`,
          )
          .join("") || T("No updates yet.", "இன்னும் தகவல்கள் இல்லை.")
      }<button class="btn" type="button" data-wf="alerts_read">${T("Mark all as read", "அனைத்தையும் படித்ததாகக் குறி")}</button>`;
    if (mockDialog.kind === "payment") {
      const c = M.project(data, actor()).find((x) => x.id === mockDialog.id);
      content = c
        ? `<h2>${T("Mock checkout", "மாதிரிக் கட்டணம்")}</h2><p>${E(c.id)} · ₹${c.fee.amount} INR</p><p>${T("No real charge. Do not enter card, bank or UPI credentials.", "உண்மையான கட்டணம் இல்லை. அட்டை, வங்கி அல்லது UPI விவரங்களை உள்ளிட வேண்டாம்.")}</p><form data-payment-form>${select(
            "method",
            T("Payment method", "கட்டண முறை"),
            options(
              [
                ["upi", "UPI"],
                ["card", T("Card", "அட்டை")],
                ["bank", T("Net banking", "இணைய வங்கி")],
              ],
              "upi",
            ),
          )}${select(
            "result",
            T("Demo outcome", "மாதிரி முடிவு"),
            options(
              [
                ["success", T("Success", "வெற்றி")],
                ["failure", T("Failure", "தோல்வி")],
              ],
              "success",
            ),
          )}<button class="btn" type="submit">${T("Simulate payment", "கட்டணத்தை முயற்சி செய்")}</button></form>`
        : T("This booking is not available.", "இந்த முன்பதிவு கிடைக்கவில்லை.");
    }
    return `<div class="wf-modal-backdrop"><section class="wf-modal" role="dialog" aria-modal="true" aria-label="${T("Demo action", "மாதிரிச் செயல்")}"><button class="wf-modal-close btn outline" type="button" data-wf="close_dialog">${T("Close", "மூடு")}</button>${content}</section></div>`;
  }
  const oldLogin = typeof loginScreen === "function" ? loginScreen : null;
  if (oldLogin)
    loginScreen = function () {
      if (role !== "client") return oldLogin();
      const people = data.clients.filter((p) => p.active);
      const person = people.find((p) => p.id === otpPerson) || people[0];
      return `<section class="login-screen"><div><h1>${T("Sign in to your client account.", "உங்கள் வாடிக்கையாளர் கணக்கில் உள்நுழையுங்கள்.")}</h1><p>${T("Try phone verification with a fictional profile. No SMS is sent.", "கற்பனைக் கணக்குடன் தொலைபேசி சரிபார்ப்பை முயற்சியுங்கள். SMS அனுப்பப்படாது.")}</p></div><div class="login-panel"><label class="wf-field">${T("Sample profile", "மாதிரிக் கணக்கு")}<select data-otp-person>${options(
        people.map((p) => [p.id, E(p.name)]),
        person?.id,
      )}</select></label><p>${T("Contact number", "தொடர்பு எண்")}: ${E(person?.phone || "0000000000")}</p><button class="btn outline" type="button" data-wf="otp_send">${otpChallenge ? T("Resend demo code", "மாதிரிக் குறியீட்டை மீண்டும் பெறு") : T("Send demo code", "மாதிரிக் குறியீட்டைப் பெறு")}</button>${otpChallenge ? `<p>${T("Demo code: 123456 · expires in 2 minutes.", "மாதிரிக் குறியீடு: 123456 · 2 நிமிடங்களில் காலாவதியாகும்.")}</p><form data-otp-form>${field("otp", T("Verification code", "சரிபார்ப்புக் குறியீடு"), '<input name="otp" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" autocomplete="one-time-code" required>')}<button class="btn" type="submit">${T("Verify and sign in", "சரிபார்த்து உள்நுழை")}</button></form>` : ""}<p role="status">${E(otpMessage)}</p></div></section>`;
    };
  function chart(title, items, currency = false) {
    const max = Math.max(1, ...items.map((x) => x[1]));
    return `<section class="wf-chart"><h2>${title}</h2>${items.map(([label, value]) => `<div class="wf-chart-row"><div><span>${label}</span><strong>${currency ? "₹" : ""}${value}${currency ? " INR" : ""}</strong></div><div class="wf-chart-track"><span style="width:${(value / max) * 100}%"></span></div></div>`).join("")}</section>`;
  }
  function performance(cases) {
    return `<div class="wf-charts">${chart(T("Consultations by stage", "நிலைவாரியான ஆலோசனைகள்"), [["requested", "awaiting_payment", "confirmed", "reschedule_requested", "in_progress", "completed", "followup", "closed", "cancelled"].map((x) => [T(...states[x]), cases.filter((c) => c.status === x).length])].flat())}${chart(
      T("Demand by service", "சேவைவாரியான கோரிக்கைகள்"),
      M.services.map((x) => [
        serviceName(x),
        cases.filter((c) => c.service === x).length,
      ]),
    )}${chart(
      T("Simulated collections by service", "சேவைவாரியான மாதிரி வசூல்"),
      M.services.map((x) => [
        serviceName(x),
        cases
          .filter((c) => c.service === x && c.fee.status === "sample_paid")
          .reduce((n, c) => n + c.fee.amount, 0),
      ]),
      true,
    )}</div>`;
  }
  words.users = ["Users", "பயனர்கள்"];
  words.team = ["Lawyers", "வழக்கறிஞர்கள்"];
  if (menus.admin && !menus.admin.includes("users"))
    menus.admin.splice(2, 0, "users");
  words.compliance = ["Follow-up tasks", "தொடர் பணிகள்"];
  words.profile = ["Profile", "கணக்கு விவரங்கள்"];
  words.availability = ["Availability", "கிடைக்கும் நேரங்கள்"];
  if (!menus.client.includes("profile")) menus.client.push("profile");
  if (!menus.lawyer.includes("availability")) menus.lawyer.push("availability");
  const screenCopy = {
    client: {
      overview: [
        "Your consultations and next steps.",
        "உங்கள் ஆலோசனைகளும் அடுத்த படிகளும்.",
        "See where each consultation stands and what needs your attention.",
        "ஒவ்வோர் ஆலோசனையின் நிலையையும் நீங்கள் செய்ய வேண்டிய பணிகளையும் பாருங்கள்.",
      ],
      consultations: [
        "Your consultations.",
        "உங்கள் ஆலோசனைகள்.",
        "Choose a consultation to view its appointment, progress and updates.",
        "சந்திப்பு விவரங்கள், முன்னேற்றம், தகவல்கள் ஆகியவற்றைப் பார்க்க ஓர் ஆலோசனையைத் தேர்ந்தெடுங்கள்.",
      ],
      vault: [
        "Your documents.",
        "உங்கள் ஆவணங்கள்.",
        "Choose a consultation to manage its requested documents and versions.",
        "கோரப்பட்ட ஆவணங்களையும் அவற்றின் பதிப்புகளையும் நிர்வகிக்க ஓர் ஆலோசனையைத் தேர்ந்தெடுங்கள்.",
      ],
      compliance: [
        "Your follow-up tasks.",
        "உங்கள் தொடர் பணிகள்.",
        "Review the preparation and follow-up agreed for your consultation.",
        "உங்கள் ஆலோசனைக்காக ஒப்புக்கொண்ட தயாரிப்புகளையும் தொடர் பணிகளையும் பாருங்கள்.",
      ],
      reports: [
        "Your consultation summaries.",
        "உங்கள் ஆலோசனைச் சுருக்கங்கள்.",
        "Read the summaries your lawyer has shared and revisit earlier versions.",
        "வழக்கறிஞர் பகிர்ந்த சுருக்கங்களையும் முந்தைய பதிப்புகளையும் படியுங்கள்.",
      ],
      profile: [
        "Your profile.",
        "உங்கள் கணக்கு விவரங்கள்.",
        "Review and update your sample contact details.",
        "உங்கள் மாதிரித் தொடர்பு விவரங்களைப் பார்த்துப் புதுப்பியுங்கள்.",
      ],
      booking: [
        "Request a consultation.",
        "ஆலோசனைக்குக் கோரிக்கை விடுங்கள்.",
        "Choose a service and preferred time, then tell the office what you need.",
        "சேவையையும் விருப்ப நேரத்தையும் தேர்ந்தெடுத்து, உங்கள் தேவையை அலுவலகத்திற்குத் தெரிவியுங்கள்.",
      ],
    },
    lawyer: {
      overview: [
        "Your work at a glance.",
        "உங்கள் பணிகள் ஒரே பார்வையில்.",
        "Review assigned consultations and the next action for each client.",
        "ஒதுக்கப்பட்ட ஆலோசனைகளையும் ஒவ்வொரு வாடிக்கையாளருக்கான அடுத்த பணியையும் பாருங்கள்.",
      ],
      schedule: [
        "Your consultation schedule.",
        "உங்கள் ஆலோசனை அட்டவணை.",
        "Check appointment times, formats and availability.",
        "சந்திப்பு நேரங்கள், முறைகள், கிடைக்கும் நேரங்கள் ஆகியவற்றைப் பாருங்கள்.",
      ],
      matters: [
        "Your assigned matters.",
        "உங்களுக்கு ஒதுக்கப்பட்ட ஆலோசனைகள்.",
        "Review client context, record outcomes and share consultation summaries.",
        "வாடிக்கையாளர் விவரங்களை ஆய்வு செய்து, முடிவுகளைப் பதிவு செய்து, ஆலோசனைச் சுருக்கங்களைப் பகிருங்கள்.",
      ],
      documents: [
        "Documents to review.",
        "ஆய்வு செய்ய வேண்டிய ஆவணங்கள்.",
        "Review the latest document versions and request anything still needed.",
        "ஆவணங்களின் சமீபத்திய பதிப்புகளை ஆய்வு செய்து, தேவையான கூடுதல் ஆவணங்களைக் கோருங்கள்.",
      ],
      followups: [
        "Client follow-ups.",
        "வாடிக்கையாளர் தொடர் பணிகள்.",
        "Review outstanding actions and the next consultation arrangements.",
        "நிலுவைப் பணிகளையும் அடுத்த ஆலோசனைக்கான ஏற்பாடுகளையும் பாருங்கள்.",
      ],
      availability: [
        "Your available times.",
        "நீங்கள் ஒதுக்கக்கூடிய நேரங்கள்.",
        "Set the sample times you can offer for consultations.",
        "ஆலோசனைகளுக்காக நீங்கள் ஒதுக்கக்கூடிய மாதிரி நேரங்களைத் தேர்ந்தெடுங்கள்.",
      ],
    },
    admin: {
      overview: [
        "Your office at a glance.",
        "அலுவலகப் பணிகள் ஒரே பார்வையில்.",
        "Review requests, active consultations and work awaiting attention.",
        "கோரிக்கைகள், நடைபெறும் ஆலோசனைகள், கவனிக்க வேண்டிய பணிகள் ஆகியவற்றைப் பாருங்கள்.",
      ],
      enquiries: [
        "Consultation requests.",
        "ஆலோசனைக் கோரிக்கைகள்.",
        "Assign lawyers and coordinate appointments, updates and follow-up.",
        "வழக்கறிஞர்களை ஒதுக்கி, சந்திப்புகள், தகவல்கள், தொடர் பணிகள் ஆகியவற்றை ஒருங்கிணையுங்கள்.",
      ],
      team: [
        "Your team’s availability.",
        "உங்கள் குழுவின் கிடைக்கும் நேரங்கள்.",
        "Review each lawyer’s services and available consultation times.",
        "ஒவ்வொரு வழக்கறிஞரின் சேவைகளையும் ஆலோசனைக்குக் கிடைக்கும் நேரங்களையும் பாருங்கள்.",
      ],
      insights: [
        "Consultation records.",
        "ஆலோசனைப் பதிவுகள்.",
        "Review sample payment records and activity for each consultation.",
        "ஒவ்வோர் ஆலோசனையின் மாதிரிக் கட்டணப் பதிவுகளையும் செயல்பாட்டு வரலாற்றையும் பாருங்கள்.",
      ],
    },
  };
  function go(label, destination, c) {
    return `<button class="btn outline" type="button" data-wf="open" data-page="${destination}" data-case="${E(c?.id || "")}">${label}</button>`;
  }
  function privateOutcome(c) {
    if (!c.outcome || role === "client") return "";
    return `<section class="wf-panel"><h2>${T("Outcome for the office", "அலுவலகத்திற்கான முடிவு")}</h2><p>${E(lang === "ta" && c.outcome.textTa ? c.outcome.textTa : c.outcome.text)}</p><small>${c.outcome.minutes} ${T("sample minutes · no automatic bill", "மாதிரி நிமிடங்கள் · தானியங்கிக் கட்டணம் இல்லை")}</small></section>`;
  }
  function workDestination(c) {
    if (role === "admin") return "enquiries";
    if (role === "lawyer")
      return ["completed", "followup"].includes(c.status)
        ? "followups"
        : "matters";
    if (c.status === "followup") return "compliance";
    if (c.documents.some((d) => !d.removed && !d.version)) return "vault";
    return "consultations";
  }
  function dashboard(cases) {
    const active = cases.filter(
      (c) => !["closed", "cancelled"].includes(c.status),
    );
    const stats =
      role === "admin"
        ? metrics(cases)
        : `<div class="wf-metrics"><div><b>${active.length}</b><span>${T("Active consultations", "செயலில் உள்ள ஆலோசனைகள்")}</span></div><div><b>${active.reduce((n, c) => n + c.documents.filter((d) => !d.removed && (role === "client" ? !d.version : d.version && !d.reviewedBy)).length, 0)}</b><span>${T("Documents needing attention", "கவனிக்க வேண்டிய ஆவணங்கள்")}</span></div><div><b>${cases.filter((c) => c.status === "followup").length}</b><span>${T("Follow-ups", "தொடர் பணிகள்")}</span></div></div>`;
    return `<div data-wf-screen="overview">${stats}<section class="wf-panel"><h2>${T("Needs attention", "கவனிக்க வேண்டியவை")}</h2>${active.length ? active.map((c) => `<article class="wf-task-row"><div><h3>${serviceName(c.service)}</h3><small>${E(c.id)} · ${names(c.client)}</small><p>${nextAction(c)}</p></div>${go(T("Open task", "பணியைத் திற"), workDestination(c), c)}</article>`).join("") : `<p>${T("No outstanding work. Your completed records remain in the consultation history.", "நிலுவைப் பணிகள் இல்லை. முடிக்கப்பட்ட பதிவுகள் ஆலோசனை வரலாற்றில் உள்ளன.")}</p>`}</section></div>`;
  }
  function schedule(cases) {
    const booked = cases
      .filter((c) =>
        [
          "awaiting_payment",
          "confirmed",
          "reschedule_requested",
          "in_progress",
        ].includes(c.status),
      )
      .sort((a, b) => a.slot - b.slot);
    return `<section class="wf-panel" data-wf-screen="schedule"><h2>${T("Appointment diary", "சந்திப்பு அட்டவணை")}</h2><p>${T("Appointments in India time. Manage offered times in Availability.", "சந்திப்புகள் இந்திய நேரத்தில். ஒதுக்கக்கூடிய நேரங்களை கிடைக்கும் நேரங்கள் பகுதியில் மாற்றலாம்.")}</p>${booked.length ? booked.map((c) => `<article class="wf-task-row"><div><h3>${slotLabel(c.slot)}</h3><p>${names(c.client)} · ${serviceName(c.service)}</p><small>${formatName(c.format)} · ${T(...states[c.status])}</small></div>${go(T("Open matter", "ஆலோசனையைத் திற"), "matters", c)}</article>`).join("") : `<div class="empty">${T("No appointments are scheduled for this lawyer.", "இந்த வழக்கறிஞருக்கு சந்திப்புகள் எதுவும் திட்டமிடப்படவில்லை.")}</div>`}${go(T("Manage availability", "கிடைக்கும் நேரங்களை நிர்வகி"), "availability")}</section>`;
  }
  function followupWork(c) {
    return `<section class="wf-panel" data-wf-screen="followups"><h2>${T("Follow-up actions", "தொடர் பணிகள்")}</h2>${c.followup ? `<h3>${c.followup.resolved ? T("Resolved", "நிறைவடைந்தது") : T("Awaiting follow-up", "தொடர் பணி நிலுவை")}</h3><p>${E(c.followup.text)}</p><p>${T("Proposed appointment", "முன்மொழியப்பட்ட சந்திப்பு")}: ${slotLabel(c.followup.slot)}</p>${c.followup.resolution ? `<p>${E(c.followup.resolution.text)}</p>` : ""}<small>${T("This proposed time is not reserved. The office must confirm arrangements.", "இந்த முன்மொழிவு நேரம் ஒதுக்கப்படவில்லை. அலுவலகம் ஏற்பாடுகளை உறுதிசெய்ய வேண்டும்.")}</small>` : `<p>${T("No follow-up action has been proposed for this consultation.", "இந்த ஆலோசனைக்குத் தொடர் பணி இன்னும் முன்மொழியப்படவில்லை.")}</p>`}${role === "lawyer" || c.status === "followup" ? controls(c) : ""}</section>${role === "lawyer" ? reports(c) : ""}<div class="wf-actions">${go(T("View requested documents", "கோரப்பட்ட ஆவணங்களைப் பார்"), role === "client" ? "vault" : "documents", c)}${role === "client" ? go(T("Read consultation summary", "ஆலோசனைச் சுருக்கத்தைப் படி"), "reports", c) : go(T("View matter", "ஆலோசனையைப் பார்"), "matters", c)}</div>`;
  }
  function insights(cases) {
    return `<div data-wf-screen="insights">${metrics(cases)}${performance(cases)}<section class="wf-panel"><h2>${T("Payment register", "கட்டணப் பதிவேடு")}</h2><p>${T("Sample records only. These figures are not real collections or firm performance.", "மாதிரிப் பதிவுகள் மட்டுமே. இவை உண்மையான வசூலையோ நிறுவனச் செயல்திறனையோ குறிக்கவில்லை.")}</p>${cases.map((c) => `<article class="wf-task-row"><div><h3>${E(c.id)} · ${names(c.client)}</h3><p>₹${c.fee.amount} INR · ${c.fee.status === "sample_paid" ? T("Simulated payment recorded", "மாதிரிக் கட்டணம் பதிவானது") : c.fee.status === "sample_due" ? T("Payment pending", "கட்டணம் நிலுவை") : T("Not requested", "இன்னும் கோரப்படவில்லை")}</p></div>${go(T("View booking", "முன்பதிவைப் பார்"), "enquiries", c)}</article>`).join("")}</section></div>`;
  }
  screenCopy.admin.users = [
    "Client accounts.",
    "வாடிக்கையாளர் கணக்குகள்.",
    "Add, edit and manage sample client accounts.",
    "மாதிரி வாடிக்கையாளர் கணக்குகளைச் சேர்த்து, திருத்தி, நிர்வகியுங்கள்.",
  ];
  screenCopy.admin.team = [
    "Your lawyers.",
    "உங்கள் வழக்கறிஞர்கள்.",
    "Manage profiles, specializations and account status.",
    "கணக்கு விவரங்கள், சிறப்புப் பிரிவுகள், கணக்கு நிலை ஆகியவற்றை நிர்வகியுங்கள்.",
  ];
  screenCopy.admin.insights = [
    "Firm performance.",
    "நிறுவனச் செயல்பாடு.",
    "Explore consultation activity and simulated collections.",
    "ஆலோசனைச் செயல்பாடுகளையும் மாதிரி வசூலையும் பாருங்கள்.",
  ];
  workspaceContent = function () {
    let { cases, c } = selection();
    const copy = screenCopy[role][page] || screenCopy[role].overview;
    let body = header() + heading(T(copy[0], copy[1]), T(copy[2], copy[3]));
    if (page === "overview") return body + dashboard(cases);
    if (page === "users" && role === "admin")
      return body + management("client");
    if (page === "team" && role === "admin") return body + management("lawyer");
    if (page === "profile" && role === "client") return body + profile();
    if (
      (page === "availability" && role === "lawyer") ||
      (page === "team" && role === "admin")
    )
      return body + availability();
    if (page === "booking" && role === "client") return body + intakeForm();
    if (page === "schedule" && role === "lawyer") return body + schedule(cases);
    if (page === "insights" && role === "admin") return body + insights(cases);
    if (page === "followups") {
      cases = cases.filter((x) =>
        ["completed", "followup", "closed"].includes(x.status),
      );
      c = cases.find((x) => x.id === c?.id) || cases[0];
    }
    const primary = ["consultations", "matters", "enquiries"].includes(page);
    body += primary ? caseIndex(cases, c) : casePicker(cases, c);
    if (!c) return body;
    if (page === "vault" || page === "documents") return body + documents(c);
    if (page === "reports") return body + reports(c);
    if (page === "compliance" || page === "followups")
      return body + followupWork(c);
    if (role === "client")
      return (
        body +
        overview(c) +
        messages(c) +
        fees(c) +
        trail(c) +
        `<div class="wf-actions">${go(T("Manage documents", "ஆவணங்களை நிர்வகி"), "vault", c)}${go(T("Read summary", "சுருக்கத்தைப் படி"), "reports", c)}${go(T("View follow-up tasks", "தொடர் பணிகளைப் பார்"), "compliance", c)}</div>`
      );
    if (role === "lawyer")
      return (
        body +
        overview(c) +
        privateOutcome(c) +
        messages(c) +
        trail(c) +
        `<div class="wf-actions">${go(T("Review documents", "ஆவணங்களை ஆய்வு செய்"), "documents", c)}${go(T("Share summary and follow up", "சுருக்கத்தைப் பகிர்ந்து தொடர் பணியை மேற்கொள்"), "followups", c)}</div>`
      );
    return (
      body +
      overview(c) +
      privateOutcome(c) +
      reports(c) +
      documents(c) +
      messages(c) +
      trail(c)
    );
  };
  function importBooking() {
    if (!pendingImport) {
      if (bootstrapAttempted) return;
      bootstrapAttempted = true;
      if (!state.booking || data.imports.length) return;
      pendingImport = {
        token: "legacy-bootstrap",
        reason: intake.reason,
        notes: intake.notes,
      };
    }
    if (!state.booking) return;
    const b = state.booking;
    const result = M.transition(
      data,
      { role: "client", id: "C1" },
      {
        type: "submit",
        service: b.service,
        slot: b.slot,
        format: b.format,
        language: b.language,
        reason:
          pendingImport.reason ||
          T(
            "Consultation requested from the public website.",
            "பொது இணையதளத்திலிருந்து ஆலோசனை கோரப்பட்டது.",
          ),
        notes: pendingImport.notes || "",
        consent: !!b.summary,
        context: b.summary ? stageName(b.summary) : "",
        sourceToken: pendingImport.token,
      },
    );
    if (!result.error) {
      data = result.state;
      if (result.caseId) {
        chosen.client = result.caseId;
        chosen.admin = result.caseId;
      }
      pendingImport = null;
      if (result.caseId) popup = alertText({ type: "requested" });
      saveWF();
    }
  }
  function syncLegacy() {
    const latest = [...data.cases].reverse().find((c) => c.sourceToken);
    if (!latest || !state.booking) return;
    state.booking.status = ["in_progress"].includes(latest.status)
      ? "confirmed"
      : ["completed", "followup", "closed"].includes(latest.status)
        ? "completed"
        : latest.status;
    state.booking.slot = latest.slot;
    state.booking.assigned =
      latest.lawyer === "L1" ? "A" : latest.lawyer === "L2" ? "B" : null;
    save();
  }
  function apply(action) {
    refreshWF();
    const result = M.transition(data, actor(), action);
    notice = result.error
      ? T(...(errors[result.error] || errors.invalid))
      : T("Sample record updated.", "மாதிரிப் பதிவு புதுப்பிக்கப்பட்டது.");
    if (!result.error) {
      data = result.state;
      if (result.caseId) chosen[role] = result.caseId;
      saveWF();
      syncLegacy();
      if (["submit", "followup_request", "pay"].includes(action.type))
        popup = alertText({
          type: action.type === "pay" ? "pay" : "requested",
        });
    }
    render();
  }
  const priorRender = render;
  render = function () {
    importBooking();
    priorRender();
    const appRoot = document.querySelector("#app");
    if (appRoot && mockDialog) {
      appRoot.insertAdjacentHTML("beforeend", dialogHTML());
      [...appRoot.children]
        .filter((el) => !el.classList.contains("wf-modal-backdrop"))
        .forEach((el) => (el.inert = true));
      appRoot.querySelector(".wf-modal button")?.focus();
    }
    if (appRoot && popup)
      appRoot.insertAdjacentHTML(
        "beforeend",
        `<aside class="wf-popup" role="alert"><p>${E(popup)}</p><button type="button" class="btn" data-wf="dismiss_popup">${T("Dismiss", "மூடு")}</button></aside>`,
      );
    if (role === "public" && page === "booking") {
      const receipt = document.querySelector(".navigation-receipt");
      const imported = [...data.cases].reverse().find((c) => c.sourceToken);
      if (receipt && imported)
        receipt.insertAdjacentHTML(
          "afterbegin",
          `<p class="wf-receipt-map">${E(imported.id)} · ${names(imported.client)} · ${T("Connected workspace reference", "இணைக்கப்பட்ட பணியிடப் பதிவு")}</p>`,
        );
      document.querySelectorAll("#bookingForm p").forEach((p) => {
        if (
          p.textContent.includes("Sample client: Demo visitor.") ||
          p.textContent.includes("மாதிரி வாடிக்கையாளர்: மாதிரி வருகையாளர்.")
        )
          p.textContent = T(
            "Sample client: Priya Raman (C1). No real name, phone number or payment details needed. The office reviews the request first.",
            "மாதிரி வாடிக்கையாளர்: பிரியா ராமன் (C1). உண்மையான பெயர், தொலைபேசி எண் அல்லது கட்டண விவரங்கள் தேவையில்லை. முதலில் அலுவலகம் கோரிக்கையை ஆய்வு செய்யும்.",
          );
      });
    }
    if (role === "public" && page === "booking" && step === 0) {
      const f = document.querySelector("#bookingForm");
      if (f && !f.querySelector('[name="wfReason"]')) {
        const target = f.querySelector(".row");
        target?.insertAdjacentHTML(
          "beforebegin",
          `<fieldset class="wf-public-intake"><legend>${T("Your reason for consulting", "ஆலோசனைக்கான உங்கள் காரணம்")}</legend><p class="tiny">${T("Use fictional details only. Saved locally with this sample request.", "கற்பனை விவரங்களை மட்டும் பயன்படுத்துங்கள். இந்த மாதிரிக் கோரிக்கையுடன் உள்ளூரில் சேமிக்கப்படும்.")}</p>${textarea("wfReason", T("Consultation reason", "ஆலோசனைக்கான காரணம்"), intake.reason, true)}${textarea("wfNotes", T("Additional notes · optional", "கூடுதல் குறிப்புகள் · விருப்பத்திற்குரியது"), intake.notes)}</fieldset>`,
        );
      }
    }
  };
  window.addEventListener("keydown", (e) => {
    if (!mockDialog) return;
    if (e.key === "Escape") {
      mockDialog = null;
      render();
      return;
    }
    if (e.key === "Tab") {
      const items = [
        ...document.querySelectorAll(
          ".wf-modal button,.wf-modal input,.wf-modal select,.wf-modal textarea",
        ),
      ].filter((x) => !x.disabled);
      const first = items[0],
        last = items.at(-1);
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    }
  });
  window.addEventListener("storage", (e) => {
    if (e.key === KEY) {
      const known = new Set(alerts().map((x) => x.id));
      data = M.restore(e.newValue);
      const incoming = alerts().find((x) => !known.has(x.id));
      if (incoming) popup = alertText(incoming);
      bootstrapAttempted = true;
      notice = T(
        "Sample records refreshed from another tab.",
        "மற்றொரு பக்கத்திலிருந்து மாதிரிப் பதிவுகள் புதுப்பிக்கப்பட்டன.",
      );
      render();
    }
  });
  window.addEventListener(
    "click",
    (e) => {
      const b = e.target.closest("[data-wf]");
      if (b) {
        e.preventDefault();
        e.stopImmediatePropagation();
        const type = b.dataset.wf,
          id = b.dataset.case,
          value = b.dataset.value;
        if (type === "dismiss_popup") {
          popup = "";
          render();
          return;
        }
        if (type === "close_dialog") {
          mockDialog = null;
          render();
          return;
        }
        if (type === "notifications") {
          mockDialog = { kind: "notifications" };
          render();
          return;
        }
        if (type === "alerts_read") {
          readAlerts = [
            ...new Set([
              ...readAlerts,
              ...alerts().map((e) => role + ":" + actor().id + ":" + e.id),
            ]),
          ];
          localStorage.setItem(
            "firm-alerts-read-v1",
            JSON.stringify(readAlerts),
          );
          render();
          return;
        }
        if (type === "alert_open") {
          readAlerts.push(role + ":" + actor().id + ":" + b.dataset.event);
          localStorage.setItem(
            "firm-alerts-read-v1",
            JSON.stringify(readAlerts),
          );
          chosen[role] = id;
          mockDialog = null;
          setRoute(
            role,
            surface,
            role === "client"
              ? b.dataset.eventType === "publish"
                ? "reports"
                : "consultations"
              : role === "lawyer"
                ? "matters"
                : "enquiries",
          );
          return;
        }
        if (type === "edit_account" && role === "admin") {
          mockDialog = {
            kind: "account",
            accountRole: b.dataset.kind,
            id: b.dataset.person || "",
          };
          photoData =
            (b.dataset.kind === "lawyer" ? data.lawyers : data.clients).find(
              (p) => p.id === b.dataset.person,
            )?.photo || "";
          render();
          return;
        }
        if (type === "pay") {
          mockDialog = { kind: "payment", id };
          render();
          return;
        }
        if (type === "otp_send") {
          const person =
            data.clients.find((p) => p.id === otpPerson && p.active) ||
            data.clients.find((p) => p.active);
          otpPerson = person?.id;
          otpChallenge = DemoAccess.request(person, Date.now());
          otpMessage = T(
            "Use the displayed demo code. Nothing was sent.",
            "காட்டப்பட்ட மாதிரிக் குறியீட்டைப் பயன்படுத்துங்கள். எதுவும் அனுப்பப்படவில்லை.",
          );
          render();
          return;
        }
        if (type === "open") {
          if (id) chosen[role] = id;
          notice = "";
          setRoute(role, surface, b.dataset.page);
          return;
        }
        if (type === "select") {
          chosen[role] = id;
          notice = "";
          render();
          return;
        }
        if (type === "new") {
          setRoute("client", surface, "booking");
          return;
        }
        apply({
          type,
          caseId: id,
          document: value,
          slot: Number(value),
          reason: T(
            "Follow-up consultation requested.",
            "தொடர் ஆலோசனை கோரப்பட்டது.",
          ),
        });
        return;
      }
      if (e.target.closest('[data-action="reset-confirm"]')) {
        data = M.make();
        pendingImport = null;
        bootstrapAttempted = true;
        chosen = {};
        intake = { reason: "", notes: "" };
        mockDialog = null;
        otpChallenge = null;
        readAlerts = [];
        popup = "";
        localStorage.setItem("firm-alerts-read-v1", "[]");
        notice = "";
        saveWF();
      }
    },
    true,
  );
  document.addEventListener("change", (e) => {
    if (e.target.matches("[data-otp-person]")) {
      otpPerson = e.target.value;
      otpChallenge = null;
      otpMessage = "";
      render();
      return;
    }
    if (e.target.matches("[data-account-photo]")) {
      const file = e.target.files?.[0];
      const error = document.querySelector(".wf-form-error");
      if (!file) return;
      if (
        !["image/jpeg", "image/png"].includes(file.type) ||
        file.size > 280000
      ) {
        if (error)
          error.textContent = T(
            "Choose a JPEG or PNG under 280 KB.",
            "280 KB-க்குள் JPEG அல்லது PNG படத்தைத் தேர்ந்தெடுங்கள்.",
          );
        e.target.value = "";
        return;
      }
      const saveButton = e.target.form.querySelector("[type=submit]");
      saveButton.disabled = true;
      const reader = new FileReader();
      reader.onerror = () => {
        saveButton.disabled = false;
      };
      reader.onload = () => {
        saveButton.disabled = false;
        photoData = String(reader.result);
        const preview = document.querySelector(".wf-photo-preview");
        if (preview)
          preview.innerHTML = `<img class="wf-avatar" src="${E(photoData)}" alt="${T("Selected photo", "தேர்ந்தெடுக்கப்பட்ட படம்")}">`;
      };
      reader.readAsDataURL(file);
      return;
    }
    if (e.target.matches("[data-wf-case]")) {
      chosen[role] = e.target.value;
      notice = "";
      render();
      return;
    }
    if (e.target.matches("[data-wf-persona]")) {
      personas[role] = e.target.value;
      chosen[role] = null;
      notice = "";
      render();
    }
  });
  window.addEventListener(
    "submit",
    (e) => {
      const f = e.target;
      if (f.matches("[data-otp-form]")) {
        e.preventDefault();
        e.stopImmediatePropagation();
        const result = DemoAccess.verify(
          otpChallenge,
          new FormData(f).get("otp"),
          Date.now(),
        );
        otpChallenge = result.challenge;
        if (result.error) {
          otpMessage = T(
            "Code incorrect, expired or attempts used. Request a fresh code if needed.",
            "குறியீடு தவறாக உள்ளது, காலாவதியானது அல்லது முயற்சிகள் முடிந்தன. தேவைப்பட்டால் புதிய குறியீட்டைப் பெறுங்கள்.",
          );
          render();
          return;
        }
        personas.client = result.id;
        chosen.client = null;
        otpMessage = "";
        otpChallenge = null;
        popup = T(
          "Phone verified for this demo.",
          "இந்த மாதிரிக்குத் தொலைபேசி சரிபார்க்கப்பட்டது.",
        );
        setRoute("client", surface, "overview");
        return;
      }
      if (f.matches("[data-payment-form]")) {
        e.preventDefault();
        e.stopImmediatePropagation();
        const id = mockDialog.id;
        const fields = new FormData(f);
        mockDialog = null;
        if (fields.get("result") === "failure") {
          popup = T(
            "Mock payment failed. Nothing was charged. You can retry.",
            "மாதிரிக் கட்டணம் தோல்வியடைந்தது. தொகை எதுவும் பிடிக்கப்படவில்லை. மீண்டும் முயற்சிக்கலாம்.",
          );
          render();
          return;
        }
        apply({ type: "pay", caseId: id });
        return;
      }
      if (f.matches("[data-account-form]")) {
        e.preventDefault();
        e.stopImmediatePropagation();
        refreshWF();
        const fields = new FormData(f);
        const result = M.transition(data, actor(), {
          type:
            mockDialog.accountRole === "lawyer"
              ? "manage_lawyer"
              : "manage_client",
          id: mockDialog.id,
          name: fields.get("name"),
          email: fields.get("email"),
          phone: fields.get("phone"),
          services: fields.getAll("services"),
          active: fields.has("active"),
          photo: fields.has("removePhoto") ? "" : photoData,
        });
        if (result.error) {
          const msg = {
            profile: T(
              "Use a name, sample email and contact number.",
              "பெயர், மாதிரி மின்னஞ்சல், தொடர்பு எண் தேவை.",
            ),
            account_busy: T(
              "Resolve or reassign open work before deactivating this account.",
              "கணக்கைச் செயலிழக்கச் செய்வதற்கு முன் நிலுவைப் பணிகளை முடிக்கவும் அல்லது மாற்றி ஒதுக்கவும்.",
            ),
            specialism_history: T(
              "A specialization used by an assigned record must be retained.",
              "ஒதுக்கப்பட்ட பதிவில் பயன்படுத்தப்படும் சிறப்புப் பிரிவைத் தக்கவைக்க வேண்டும்.",
            ),
            specialism: T(
              "Select at least one specialization.",
              "குறைந்தது ஒரு சிறப்புப் பிரிவைத் தேர்ந்தெடுங்கள்.",
            ),
            duplicate: T(
              "That sample email is already used.",
              "அந்த மாதிரி மின்னஞ்சல் ஏற்கெனவே உள்ளது.",
            ),
          };
          f.querySelector(".wf-form-error").textContent =
            msg[result.error] ||
            T(
              "Check the entered details.",
              "உள்ளிட்ட விவரங்களைச் சரிபாருங்கள்.",
            );
          return;
        }
        data = result.state;
        saveWF();
        mockDialog = null;
        notice = T("Account saved.", "கணக்கு சேமிக்கப்பட்டது.");
        render();
        return;
      }
      if (f.matches("[data-wf-form]")) {
        e.preventDefault();
        e.stopImmediatePropagation();
        const a = Object.fromEntries(new FormData(f));
        a.type = f.dataset.wfForm;
        a.caseId = f.dataset.case;
        if ("slot" in a) a.slot = Number(a.slot);
        if ("minutes" in a) a.minutes = Number(a.minutes);
        apply(a);
        return;
      }
      if (f.id === "bookingForm") {
        refreshWF();
        if (step === 0) {
          intake.reason = f.elements.wfReason?.value || "";
          intake.notes = f.elements.wfNotes?.value || "";
        }
        if (
          step === 2 &&
          (!state.booking ||
            ["completed", "cancelled"].includes(state.booking.status))
        ) {
          pendingImport = pendingImport || {
            token:
              "public-" +
              Date.now() +
              "-" +
              Math.random().toString(36).slice(2),
            ...intake,
          };
          const check = M.transition(
            data,
            { role: "client", id: "C1" },
            {
              type: "submit",
              service: state.service,
              slot: state.slot,
              format: state.format,
              language: state.language,
              reason:
                intake.reason ||
                T("Public consultation request", "பொது ஆலோசனைக் கோரிக்கை"),
              notes: intake.notes,
              sourceToken: pendingImport.token,
            },
          );
          if (check.error) {
            e.preventDefault();
            e.stopImmediatePropagation();
            pendingImport = null;
            const old = f.querySelector(".wf-notice");
            if (old) old.remove();
            f.insertAdjacentHTML(
              "afterbegin",
              `<p class="wf-notice" role="alert">${E(T(...(errors[check.error] || errors.invalid)))}</p>`,
            );
          }
        }
      }
    },
    true,
  );
  render();
})();
