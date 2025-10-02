export function checkUserInGroup(user, membershipRule) {
  try {
    let expr = membershipRule;

    // Step 1: Replace operators
    // Match operands as: "quoted string" | non-space token
    const operand = `"[^"]*"|\\S+`;

    expr = expr
      .replace(new RegExp(`(${operand})\\s*-eq\\s*(${operand})`, "gi"), "($1 === $2)")
      .replace(new RegExp(`(${operand})\\s*-ne\\s*(${operand})`, "gi"), "($1 !== $2)")
      .replace(new RegExp(`(${operand})\\s*-contains\\s*(${operand})`, "gi"), "($1.includes($2))")
      .replace(new RegExp(`(${operand})\\s*-startsWith\\s*(${operand})`, "gi"), "($1.startsWith($2))")
      .replace(new RegExp(`(${operand})\\s*-in\\s*(${operand})`, "gi"), "helpers.__in($1, $2)")
      .replace(/\s*-and\s*/gi, " && ")
      .replace(/\s*-or\s*/gi, " || ")
      .replace(/\bTrue\b/gi, "true")
      .replace(/\bFalse\b/gi, "false");

    // Step 2: Replace user attributes
    expr = expr.replace(/user\.([a-zA-Z0-9_]+)/g, (_, attr) => {
      const val = user[attr];
      if (val === undefined || val === null) return "undefined";
      if (typeof val === "string") return JSON.stringify(val); // handles quotes safely
      if (typeof val === "boolean") return val ? "true" : "false";
      return val;
    });

    const helpers = {
      __in: (val, arr) => (Array.isArray(arr) ? arr.includes(val) : false),
    };

    // Debug logging
    console.log("🔍 Original Rule:", membershipRule);
    console.log("🔍 Translated Expression:", expr);

    const result = Function("helpers", `"use strict"; return (${expr});`)(helpers);

    console.log("✅ Eval Result:", result);

    return result ? "In Group" : "Not in Group";
  } catch (err) {
    console.error("❌ Validator error:", err.message);
    console.error("   Rule:", membershipRule);
    console.error("   User:", user);
    return `Unknown`;
  }
}
