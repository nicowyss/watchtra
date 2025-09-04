export function checkUserInGroup(user, membershipRule) {
  try {
    let expr = membershipRule;

    // Replace Entra operators with JS
    expr = expr
      .replace(/-eq/g, "===")
      .replace(/-ne/g, "!==")
      .replace(/-contains/g, ".includes")
      .replace(/-startsWith/g, ".startsWith")
      .replace(/-in/g, ".__in")
      .replace(/\band\b/gi, "&&")
      .replace(/\bor\b/gi, "||")
      .replace(/\bTrue\b/gi, "true")
      .replace(/\bFalse\b/gi, "false");

    // Replace user attributes
    expr = expr.replace(/user\.([a-zA-Z]+)/g, (_, attr) => {
      const val = user[attr];
      if (val === undefined || val === null) return "undefined";
      if (typeof val === "string") return `"${val}"`;
      if (typeof val === "boolean") return val ? "true" : "false";
      return val;
    });

    const helpers = { __in: (val, arr) => (Array.isArray(arr) ? arr.includes(val) : false) };

    // console.log("🔍 Original Rule:", membershipRule);
    // console.log("🔍 Translated Expression:", expr);

    const result = Function("helpers", `"use strict"; return (${expr});`)(helpers);

    // console.log("✅ Eval Result:", result);

    return result ? "In Group" : "Not in Group";
  } catch (err) {
    console.error("❌ Validator error:", err.message, "Rule:", membershipRule, "User:", user);
    return `Unknown`;
    // return `Unknown (error: ${err.message})`;

  }
}
