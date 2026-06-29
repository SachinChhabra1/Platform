// Planted violations. NOT real source. Used only by selftest.mjs to prove each
// lint gate is fail-closed. Every line below MUST be caught by a gate.

// no-pii-in-logs:
console.log(`processing phone ${somePhone}`);

// no-hardcoded-theme:
const brandInk = "#1A1A1A";

// i18n-required:
const label = "Send money home";
