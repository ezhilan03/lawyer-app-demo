/* Deliberately visible OTP for local demonstrations; never real authentication. */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.DemoAccess = factory();
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  function request(person, now) {
    if (!person?.active) return { error: "inactive" };
    return {
      id: person.id,
      phone: person.phone || "0000000000",
      code: "123456",
      expires: now + 120000,
      attempts: 0,
      verified: false,
    };
  }
  function verify(challenge, code, now) {
    if (!challenge || challenge.error)
      return { error: "request_first", challenge };
    if (now >= challenge.expires) return { error: "expired", challenge };
    if (challenge.attempts >= 5) return { error: "locked", challenge };
    if (challenge.verified) return { error: "used", challenge };
    const next = { ...challenge, attempts: challenge.attempts + 1 };
    if (String(code) !== next.code) return { error: "wrong", challenge: next };
    next.verified = true;
    return { error: null, challenge: next, id: next.id };
  }
  return { request, verify };
});
