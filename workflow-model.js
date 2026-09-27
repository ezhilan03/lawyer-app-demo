/* Pure synthetic workflow model. Role checks demonstrate UI behaviour, not browser security. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.WorkflowModel = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  const statuses = [
    "requested",
    "awaiting_payment",
    "confirmed",
    "reschedule_requested",
    "in_progress",
    "completed",
    "followup",
    "closed",
    "cancelled",
  ];
  const slots = [
    "2026-10-06T10:00:00+05:30",
    "2026-10-07T14:30:00+05:30",
    "2026-10-08T11:00:00+05:30",
    "2026-10-09T10:00:00+05:30",
  ];
  const services = ["property", "rental", "business"];
  const copy = (x) => JSON.parse(JSON.stringify(x));
  const text = (x) => (typeof x === "string" ? x.trim().slice(0, 1200) : "");
  const active = (c) =>
    [
      "awaiting_payment",
      "confirmed",
      "reschedule_requested",
      "in_progress",
    ].includes(c.status);
  function event(s, c, type, actor, visibility = "client") {
    const e = {
      id: "E" + s.nextEvent++,
      type,
      role: actor.role,
      actor: actor.id,
      visibility,
    };
    c.events.push(e);
    return e.id;
  }
  function record(s, actor, a) {
    const c = {
      id: "WF-" + String(s.nextCase++).padStart(3, "0"),
      client: actor.id,
      service: a.service,
      slot: a.slot,
      format: a.format || "office",
      language: a.language || "ta",
      reason: text(a.reason),
      notes: text(a.notes),
      sharedContext: a.consent ? text(a.context) : "",
      status: "requested",
      lawyer: null,
      pendingSlot: null,
      meeting: null,
      fee: {
        amount: 1000,
        currency: "INR",
        status: "not_requested",
        policy: "provisional",
      },
      documents: [],
      messages: [],
      outcome: null,
      report: null,
      followup: null,
      events: [],
      sourceToken: a.sourceToken || null,
      parentId: a.parentId || null,
    };
    s.cases.push(c);
    event(s, c, "requested", actor);
    return c;
  }
  function make() {
    const s = {
      version: 3,
      nextCase: 1,
      nextEvent: 1,
      clients: [
        {
          id: "C1",
          name: "Priya Raman",
          nameTa: "பிரியா ராமன்",
          email: "priya@example.invalid",
          phone: "0000000000",
          active: true,
        },
        {
          id: "C2",
          name: "Karthik Selvam",
          nameTa: "கார்த்திக் செல்வம்",
          email: "karthik@example.invalid",
          phone: "0000000000",
          active: true,
        },
      ],
      lawyers: [
        {
          id: "L1",
          name: "Lawyer A",
          nameTa: "வழக்கறிஞர் A",
          services: ["property", "rental"],
          availability: [0, 1, 2],
          active: true,
        },
        {
          id: "L2",
          name: "Lawyer B",
          nameTa: "வழக்கறிஞர் B",
          services: ["business", "rental"],
          availability: [0, 1, 3],
          active: true,
        },
      ],
      cases: [],
      imports: [],
    };
    const a = record(
      s,
      { role: "client", id: "C1" },
      {
        service: "property",
        slot: 2,
        reason: "Prepare for a property document review.",
        notes: "Synthetic example; no real property details.",
        language: "ta",
      },
    );
    a.reasonTa = "சொத்து ஆவண ஆய்வுக்குத் தயாராக வேண்டும்.";
    a.notesTa = "கற்பனை உதாரணம்; உண்மையான சொத்து விவரங்கள் இல்லை.";
    const b = record(
      s,
      { role: "client", id: "C2" },
      {
        service: "business",
        slot: 1,
        reason: "Review a supplier agreement.",
        language: "en",
      },
    );
    b.reasonTa = "சப்ளையர் ஒப்பந்தத்தை ஆய்வு செய்ய வேண்டும்.";
    b.lawyer = "L2";
    b.status = "confirmed";
    b.fee.status = "sample_paid";
    b.meeting = "video_sample";
    b.format = "video";
    event(s, b, "assigned", { role: "admin", id: "ADMIN" });
    event(s, b, "sample_payment", { role: "client", id: "C2" });
    const c = record(
      s,
      { role: "client", id: "C1" },
      {
        service: "rental",
        slot: 3,
        reason: "Understand a rental draft.",
        language: "ta",
      },
    );
    c.reasonTa = "வாடகை வரைவைப் புரிந்துகொள்ள வேண்டும்.";
    c.lawyer = "L2";
    c.status = "closed";
    c.fee.status = "sample_paid";
    c.outcome = {
      text: "Confirm the remaining questions before agreeing further work.",
      textTa:
        "அடுத்த பணியை ஒப்புக்கொள்ளும் முன் மீதமுள்ள கேள்விகளை உறுதிசெய்யுங்கள்.",
      minutes: 30,
      author: "L2",
    };
    c.report = copy(c.outcome);
    c.messages.push({
      id: "M0",
      author: "L2",
      role: "lawyer",
      visibility: "internal",
      text: "Synthetic internal handover note.",
      textTa: "கற்பனையான உள் ஒருங்கிணைப்புக் குறிப்பு.",
    });
    event(s, c, "closed", { role: "admin", id: "ADMIN" });
    return s;
  }
  function validActor(s, a) {
    return (
      a &&
      ((a.role === "admin" && a.id === "ADMIN") ||
        (a.role === "client" &&
          s.clients.some((x) => x.id === a.id && x.active)) ||
        (a.role === "lawyer" &&
          s.lawyers.some((x) => x.id === a.id && x.active)))
    );
  }
  function allowed(s, a, c) {
    return (
      validActor(s, a) &&
      (a.role === "admin" ||
        (a.role === "client" && c.client === a.id) ||
        (a.role === "lawyer" && c.lawyer === a.id))
    );
  }
  function available(s, lawyer, slot, except) {
    const l = s.lawyers.find((x) => x.id === lawyer);
    return (
      !!l &&
      l.active &&
      l.availability.includes(slot) &&
      !s.cases.some(
        (c) =>
          c.id !== except &&
          c.lawyer === lawyer &&
          c.slot === slot &&
          active(c),
      )
    );
  }
  function project(s, actor) {
    if (!validActor(s, actor)) return [];
    return s.cases
      .filter((c) => allowed(s, actor, c))
      .map((c) => {
        const v = copy(c);
        if (actor.role === "client") {
          v.messages = v.messages.filter((m) => m.visibility === "client");
          v.events = v.events.filter((e) => e.visibility === "client");
          delete v.outcome;
          delete v.notesInternal;
        }
        return v;
      });
  }
  function clientReserved(s, client, slot, except) {
    return s.cases.some(
      (c) =>
        c.id !== except && c.client === client && c.slot === slot && active(c),
    );
  }
  function transition(original, actor, a) {
    const s = copy(original);
    const fail = (error) => ({ state: original, error });
    if (!validActor(s, actor)) return fail("forbidden");
    if (!a || typeof a.type !== "string") return fail("invalid");
    if (a.type === "submit") {
      if (actor.role !== "client") return fail("forbidden");
      if (
        !services.includes(a.service) ||
        !Number.isInteger(a.slot) ||
        !slots[a.slot] ||
        !["office", "video", "phone"].includes(a.format || "office") ||
        !["en", "ta"].includes(a.language || "ta") ||
        !text(a.reason)
      )
        return fail("intake");
      if (a.sourceToken && s.imports.includes(a.sourceToken))
        return { state: original, error: null };
      if (
        s.cases.some(
          (c) =>
            c.client === actor.id &&
            c.service === a.service &&
            c.slot === a.slot &&
            !["completed", "followup", "closed", "cancelled"].includes(
              c.status,
            ),
        )
      )
        return fail("duplicate");
      const c = record(s, actor, a);
      if (a.sourceToken) s.imports.push(a.sourceToken);
      return { state: s, error: null, caseId: c.id };
    }
    if (["manage_client", "manage_lawyer"].includes(a.type)) {
      if (actor.role !== "admin") return fail("forbidden");
      const lawyer = a.type === "manage_lawyer";
      const list = lawyer ? s.lawyers : s.clients;
      const prefix = lawyer ? "L" : "C";
      let person = a.id ? list.find((p) => p.id === a.id) : null;
      if (a.id && !person) return fail("invalid");
      if (
        !text(a.name) ||
        !/^[^@\s]+@example\.invalid$/.test(text(a.email)) ||
        !/^\+?[0-9 ()-]{7,20}$/.test(text(a.phone))
      )
        return fail("profile");
      if (
        list.some(
          (p) =>
            p.id !== a.id &&
            (p.email || "").toLowerCase() === text(a.email).toLowerCase(),
        )
      )
        return fail("duplicate");
      if (
        lawyer &&
        (!Array.isArray(a.services) ||
          !a.services.length ||
          a.services.some((x) => !services.includes(x)))
      )
        return fail("specialism");
      if (
        a.photo &&
        (!/^data:image\/(png|jpeg);base64,[A-Za-z0-9+/=]+$/.test(a.photo) ||
          a.photo.length > 400000)
      )
        return fail("photo");
      if (
        person &&
        a.active === false &&
        s.cases.some(
          (c) =>
            (lawyer ? c.lawyer : c.client) === person.id &&
            !["closed", "cancelled"].includes(c.status),
        )
      )
        return fail("account_busy");
      if (
        person &&
        lawyer &&
        s.cases.some(
          (c) => c.lawyer === person.id && !a.services.includes(c.service),
        )
      )
        return fail("specialism_history");
      if (!person) {
        if (list.length >= 50) return fail("invalid");
        const number =
          Math.max(0, ...list.map((p) => Number(p.id.slice(1)))) + 1;
        person = { id: prefix + number };
        if (lawyer) person.availability = [];
        list.push(person);
      }
      Object.assign(person, {
        name: text(a.name).slice(0, 70),
        nameTa: text(a.name).slice(0, 70),
        email: text(a.email).slice(0, 100),
        phone: text(a.phone),
        active: a.active !== false,
      });
      if (lawyer) {
        person.services = [...new Set(a.services)];
        person.photo = a.photo || "";
      }
      return { state: s, error: null, personId: person.id };
    }
    if (a.type === "profile") {
      if (actor.role !== "client") return fail("forbidden");
      const p = s.clients.find((x) => x.id === actor.id);
      if (
        !text(a.name) ||
        !/^[^@\s]+@example\.invalid$/.test(text(a.email)) ||
        (a.phone !== undefined && !/^\+?[0-9 ()-]{7,20}$/.test(text(a.phone)))
      )
        return fail("profile");
      p.name = text(a.name).slice(0, 70);
      p.nameTa = p.name;
      p.email = text(a.email).slice(0, 100);
      if (a.phone !== undefined) p.phone = text(a.phone);
      return { state: s, error: null };
    }
    if (a.type === "availability") {
      if (
        actor.role !== "lawyer" ||
        !Number.isInteger(a.slot) ||
        !slots[a.slot]
      )
        return fail("forbidden");
      const l = s.lawyers.find((x) => x.id === actor.id);
      if (l.availability.includes(a.slot)) {
        if (
          s.cases.some(
            (c) => c.lawyer === l.id && c.slot === a.slot && active(c),
          )
        )
          return fail("reserved");
        l.availability = l.availability.filter((x) => x !== a.slot);
      } else l.availability.push(a.slot);
      return { state: s, error: null };
    }
    const c = s.cases.find((x) => x.id === a.caseId);
    if (!c || !allowed(s, actor, c)) return fail("forbidden");
    const owner = actor.role === "client" && actor.id === c.client,
      lawyer = actor.role === "lawyer" && actor.id === c.lawyer,
      admin = actor.role === "admin";
    let visibility = "client";
    switch (a.type) {
      case "assign": {
        if (
          !admin ||
          ![
            "requested",
            "awaiting_payment",
            "confirmed",
            "reschedule_requested",
          ].includes(c.status)
        )
          return fail("transition");
        const l = s.lawyers.find((x) => x.id === a.lawyer);
        if (!l || !l.services.includes(c.service)) return fail("specialism");
        if (clientReserved(s, c.client, c.slot, c.id))
          return fail("client_collision");
        if (!available(s, l.id, c.slot, c.id)) return fail("collision");
        const was = c.lawyer;
        c.lawyer = l.id;
        if (c.status === "requested") {
          c.status = "awaiting_payment";
          c.fee.status = "sample_due";
        }
        if (was && was !== l.id) {
          c.documents.forEach((d) => {
            d.reviewedBy = null;
            d.reviewedVersion = null;
          });
          c.meeting = null;
        }
        break;
      }
      case "pay":
        if (!owner || c.status !== "awaiting_payment" || !c.lawyer)
          return fail("transition");
        c.fee.status = "sample_paid";
        c.status = "confirmed";
        break;
      case "reschedule":
        if (
          !owner ||
          c.status !== "confirmed" ||
          !Number.isInteger(a.slot) ||
          !slots[a.slot] ||
          a.slot === c.slot
        )
          return fail("transition");
        c.pendingSlot = a.slot;
        c.status = "reschedule_requested";
        break;
      case "approve_reschedule":
        if (!admin || c.status !== "reschedule_requested")
          return fail("transition");
        if (clientReserved(s, c.client, c.pendingSlot, c.id))
          return fail("client_collision");
        if (!available(s, c.lawyer, c.pendingSlot, c.id))
          return fail("collision");
        c.slot = c.pendingSlot;
        c.pendingSlot = null;
        c.status = "confirmed";
        c.meeting = null;
        break;
      case "decline_reschedule":
        if (!admin || c.status !== "reschedule_requested")
          return fail("transition");
        c.pendingSlot = null;
        c.status = "confirmed";
        break;
      case "withdraw_reschedule":
        if (!owner || c.status !== "reschedule_requested")
          return fail("transition");
        c.pendingSlot = null;
        c.status = "confirmed";
        break;
      case "cancel":
        if (
          !(owner || admin) ||
          ![
            "requested",
            "awaiting_payment",
            "confirmed",
            "reschedule_requested",
          ].includes(c.status)
        )
          return fail("transition");
        c.status = "cancelled";
        c.pendingSlot = null;
        c.meeting = null;
        break;
      case "meeting":
        if (
          !admin ||
          !["awaiting_payment", "confirmed", "reschedule_requested"].includes(
            c.status,
          )
        )
          return fail("transition");
        if (
          !["office_sample", "video_sample", "phone_sample"].includes(a.meeting)
        )
          return fail("invalid");
        c.meeting = a.meeting;
        c.format = {
          office_sample: "office",
          video_sample: "video",
          phone_sample: "phone",
        }[a.meeting];
        break;
      case "doc_request":
        if (
          !(lawyer || admin) ||
          ![
            "requested",
            "awaiting_payment",
            "confirmed",
            "in_progress",
            "followup",
          ].includes(c.status) ||
          !text(a.label)
        )
          return fail("transition");
        c.documents.push({
          id: "D" + s.nextEvent,
          label: text(a.label).slice(0, 100),
          labelTa: text(a.labelTa),
          requestedBy: actor.id,
          version: 0,
          versions: [],
          reviewedBy: null,
          reviewedVersion: null,
          reviews: [],
          removed: false,
        });
        break;
      case "doc_add":
      case "doc_replace":
      case "doc_remove": {
        if (
          !owner ||
          ![
            "requested",
            "awaiting_payment",
            "confirmed",
            "reschedule_requested",
            "followup",
          ].includes(c.status)
        )
          return fail("transition");
        let d = c.documents.find((x) => x.id === a.document);
        if (
          c.status === "followup" &&
          (a.type !== "doc_add" || !d || d.version)
        )
          return fail("transition");
        if (a.type === "doc_add" && !d) {
          d = {
            id: "D" + s.nextEvent,
            label: "Sample document",
            labelTa: "மாதிரி ஆவணம்",
            requestedBy: null,
            version: 0,
            versions: [],
            reviewedBy: null,
            reviewedVersion: null,
            reviews: [],
            removed: false,
          };
          c.documents.push(d);
        }
        if (!d) return fail("invalid");
        if (a.type === "doc_remove") {
          if (!d.version || d.removed) return fail("transition");
          d.removed = true;
        } else {
          if (a.type === "doc_replace" && (!d.version || d.removed))
            return fail("transition");
          d.version++;
          d.versions.push({
            version: d.version,
            addedBy: actor.id,
            event: "E" + s.nextEvent,
          });
          d.removed = false;
        }
        d.reviewedBy = null;
        d.reviewedVersion = null;
        break;
      }
      case "doc_review": {
        if (
          !lawyer ||
          !["confirmed", "in_progress", "completed", "followup"].includes(
            c.status,
          )
        )
          return fail("transition");
        const d = c.documents.find((x) => x.id === a.document);
        if (!d || !d.version || d.removed) return fail("invalid");
        d.reviewedBy = actor.id;
        d.reviewedVersion = d.version;
        d.reviews = d.reviews || [];
        d.reviews.push({
          version: d.version,
          author: actor.id,
          event: "E" + s.nextEvent,
        });
        break;
      }
      case "message":
        if (
          !text(a.text) ||
          !["client", "internal"].includes(a.visibility) ||
          (owner && a.visibility !== "client")
        )
          return fail("forbidden");
        if (["closed", "cancelled"].includes(c.status))
          return fail("transition");
        c.messages.push({
          id: "M" + s.nextEvent,
          author: actor.id,
          role: actor.role,
          visibility: a.visibility,
          text: text(a.text),
        });
        visibility = a.visibility;
        break;
      case "start":
        if (!lawyer || c.status !== "confirmed") return fail("transition");
        c.status = "in_progress";
        break;
      case "complete":
        if (
          !lawyer ||
          c.status !== "in_progress" ||
          !text(a.outcome) ||
          !Number.isInteger(a.minutes) ||
          a.minutes < 1 ||
          a.minutes > 480
        )
          return fail("outcome");
        c.outcome = {
          text: text(a.outcome),
          minutes: a.minutes,
          author: actor.id,
        };
        c.status = "completed";
        visibility = "internal";
        break;
      case "publish":
        if (
          !lawyer ||
          !["completed", "followup"].includes(c.status) ||
          !c.outcome ||
          !text(a.text)
        )
          return fail("transition");
        c.reportHistory = c.reportHistory || [];
        if (c.report) c.reportHistory.push(copy(c.report));
        c.report = {
          text: text(a.text),
          author: actor.id,
          version: c.reportHistory.length + 1,
        };
        break;
      case "followup":
        if (
          !lawyer ||
          c.status !== "completed" ||
          !text(a.text) ||
          !Number.isInteger(a.slot) ||
          !slots[a.slot]
        )
          return fail("transition");
        c.followup = {
          text: text(a.text),
          slot: a.slot,
          author: actor.id,
          reserved: false,
          resolved: false,
        };
        c.status = "followup";
        break;
      case "followup_request":
        if (
          !owner ||
          c.status !== "followup" ||
          !c.followup ||
          c.followup.resolved
        )
          return fail("transition");
        if (
          s.cases.some(
            (x) =>
              x.parentId === c.id &&
              !["cancelled", "closed"].includes(x.status),
          )
        )
          return fail("duplicate");
        {
          const child = record(s, actor, {
            service: c.service,
            slot: c.followup.slot,
            format: c.format,
            language: c.language,
            reason: text(a.reason) || "Follow-up consultation request.",
            notes: "",
            parentId: c.id,
          });
          event(s, c, "followup_request", actor);
          return { state: s, error: null, caseId: child.id };
        }
      case "resolve_followup":
        if (
          !admin ||
          c.status !== "followup" ||
          !c.followup ||
          c.followup.resolved ||
          !text(a.text)
        )
          return fail("transition");
        c.followup.resolved = true;
        c.followup.resolution = { text: text(a.text), author: actor.id };
        break;
      case "close":
        if (c.followup && !c.followup.resolved) return fail("followup_open");
        if (
          !admin ||
          !["completed", "followup"].includes(c.status) ||
          !c.report
        )
          return fail("transition");
        c.status = "closed";
        break;
      case "reopen":
        if (!admin || c.status !== "closed") return fail("transition");
        c.status = "followup";
        c.followup = {
          text: text(a.reason) || "Review the reopened consultation.",
          slot: c.slot,
          author: actor.id,
          reserved: false,
          resolved: false,
        };
        break;
      default:
        return fail("invalid");
    }
    event(s, c, a.type, actor, visibility);
    return { state: s, error: null, caseId: c.id };
  }
  function restore(raw) {
    try {
      const s = typeof raw === "string" ? JSON.parse(raw) : copy(raw);
      if (
        !s ||
        s.version !== 3 ||
        !Number.isInteger(s.nextCase) ||
        s.nextCase < 1 ||
        !Number.isInteger(s.nextEvent) ||
        s.nextEvent < 1 ||
        !Array.isArray(s.cases) ||
        s.cases.length > 200 ||
        !Array.isArray(s.imports) ||
        s.imports.some((x) => typeof x !== "string") ||
        !Array.isArray(s.clients) ||
        !Array.isArray(s.lawyers)
      )
        return make();
      const base = make();
      if (
        s.clients.length < 2 ||
        s.clients.length > 50 ||
        s.lawyers.length < 2 ||
        s.lawyers.length > 50 ||
        new Set(s.clients.map((x) => x.id)).size !== s.clients.length ||
        new Set(s.lawyers.map((x) => x.id)).size !== s.lawyers.length
      )
        return make();
      for (const p of s.clients)
        if (
          !/^C[1-9][0-9]*$/.test(p.id) ||
          typeof p.name !== "string" ||
          typeof p.email !== "string" ||
          typeof p.active !== "boolean"
        )
          return make();
      for (const l of s.lawyers)
        if (
          !/^L[1-9][0-9]*$/.test(l.id) ||
          typeof l.name !== "string" ||
          (l.email !== undefined && typeof l.email !== "string") ||
          (l.phone !== undefined && typeof l.phone !== "string") ||
          (l.photo &&
            (!/^data:image\/(png|jpeg);base64,[A-Za-z0-9+/=]+$/.test(l.photo) ||
              l.photo.length > 400000)) ||
          !Array.isArray(l.availability) ||
          l.availability.some((x) => !Number.isInteger(x) || !slots[x]) ||
          !Array.isArray(l.services) ||
          l.services.some((x) => !services.includes(x)) ||
          typeof l.active !== "boolean"
        )
          return make();
      const ids = new Set();
      for (const c of s.cases) {
        if (
          !c ||
          typeof c.id !== "string" ||
          ids.has(c.id) ||
          !s.clients.some((x) => x.id === c.client) ||
          !services.includes(c.service) ||
          !statuses.includes(c.status) ||
          !Number.isInteger(c.slot) ||
          !slots[c.slot] ||
          !["office", "video", "phone"].includes(c.format) ||
          !["en", "ta"].includes(c.language) ||
          typeof c.reason !== "string" ||
          typeof c.notes !== "string" ||
          (c.lawyer !== null && !s.lawyers.some((x) => x.id === c.lawyer)) ||
          !Array.isArray(c.documents) ||
          !Array.isArray(c.messages) ||
          !Array.isArray(c.events) ||
          !c.fee ||
          c.fee.currency !== "INR"
        )
          return make();
        if (
          c.lawyer &&
          !s.lawyers.find((l) => l.id === c.lawyer).services.includes(c.service)
        )
          return make();
        if (
          !["not_requested", "sample_due", "sample_paid"].includes(
            c.fee.status,
          ) ||
          c.fee.amount !== 1000 ||
          c.fee.policy !== "provisional"
        )
          return make();
        if (
          c.status === "requested" &&
          (c.lawyer !== null || c.fee.status !== "not_requested")
        )
          return make();
        if (c.status === "awaiting_payment" && c.fee.status !== "sample_due")
          return make();
        if (
          [
            "confirmed",
            "reschedule_requested",
            "in_progress",
            "completed",
            "followup",
            "closed",
          ].includes(c.status) &&
          c.fee.status !== "sample_paid"
        )
          return make();
        if (
          ["completed", "followup", "closed"].includes(c.status) &&
          (!c.outcome || !c.lawyer)
        )
          return make();
        if (c.status === "closed" && !c.report) return make();
        if (c.followup && c.status === "closed" && !c.followup.resolved)
          return make();
        ids.add(c.id);
        if (new Set(c.documents.map((x) => x.id)).size !== c.documents.length)
          return make();
        if (active(c) && !c.lawyer) return make();
        if (
          c.pendingSlot !== null &&
          (!Number.isInteger(c.pendingSlot) || !slots[c.pendingSlot])
        )
          return make();
        for (const d of c.documents)
          if (
            !d ||
            typeof d.id !== "string" ||
            typeof d.label !== "string" ||
            !Number.isInteger(d.version) ||
            d.version < 0 ||
            !Array.isArray(d.versions) ||
            typeof d.removed !== "boolean" ||
            d.versions.length !== d.version ||
            d.versions.some(
              (v, i) =>
                !v || v.version !== i + 1 || typeof v.addedBy !== "string",
            ) ||
            (d.reviewedVersion !== null && d.reviewedVersion !== d.version) ||
            (d.reviewedBy !== null &&
              !s.lawyers.some((l) => l.id === d.reviewedBy))
          )
            return make();
        for (const m of c.messages)
          if (
            !m ||
            typeof m.text !== "string" ||
            !["internal", "client"].includes(m.visibility) ||
            typeof m.author !== "string"
          )
            return make();
        for (const e of c.events)
          if (
            !e ||
            typeof e.type !== "string" ||
            typeof e.id !== "string" ||
            !["internal", "client"].includes(e.visibility)
          )
            return make();
        if (
          (c.report && typeof c.report.text !== "string") ||
          (c.outcome && typeof c.outcome.text !== "string") ||
          (c.followup &&
            (!slots[c.followup.slot] || typeof c.followup.text !== "string"))
        )
          return make();
      }
      const maxCase = Math.max(
        0,
        ...s.cases.map((c) => Number(c.id.replace("WF-", ""))),
      );
      const events = s.cases.flatMap((c) => c.events);
      if (new Set(events.map((e) => e.id)).size !== events.length)
        return make();
      const maxEvent = Math.max(
        0,
        ...events.map((e) => Number(e.id.slice(1))),
        ...s.cases.flatMap((c) =>
          c.documents.map((d) => Number(d.id.slice(1))),
        ),
      );
      if (
        !Number.isFinite(maxCase) ||
        !Number.isFinite(maxEvent) ||
        s.nextCase <= maxCase ||
        s.nextEvent <= maxEvent
      )
        return make();
      for (const c of s.cases) {
        if (
          c.parentId &&
          !s.cases.some((x) => x.id === c.parentId && x.client === c.client)
        )
          return make();
        if (
          active(c) &&
          s.cases.some(
            (x) =>
              x.id !== c.id &&
              active(x) &&
              x.slot === c.slot &&
              (x.client === c.client || x.lawyer === c.lawyer),
          )
        )
          return make();
      }
      // Upgrade older local records whose meeting channel and format disagreed.
      for (const c of s.cases) {
        const format = {
          office_sample: "office",
          video_sample: "video",
          phone_sample: "phone",
        }[c.meeting];
        if (format) c.format = format;
      }
      return s;
    } catch {
      return make();
    }
  }
  return {
    make,
    transition,
    project,
    restore,
    available,
    slots,
    services,
    statuses,
  };
});
