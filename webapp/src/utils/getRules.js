// src/utils/getRules.js
import memberRulesLocal from "../../app/rules/members.json";
import guestRulesLocal from "../../app/rules/guests.json";
import siteConfig from "@generated/docusaurus.config"; // Docusaurus config import

/**
 * Get member and guest rules based on environment.
 * - dev: returns local JSON
 * - prod: fetches from Azure Function, which proxies Storage
 */
export async function getRules() {
  const { functionUrl } = siteConfig.customFields;

  if (process.env.NODE_ENV === "development") {
    console.log("Development mode: using local rules JSON.");
    return {
      members: memberRulesLocal,
      guests: guestRulesLocal,
    };
  }

  // Production: fetch via Function API (no SAS exposed)
  try {
    console.log("Production mode: fetching rules from Azure Function.");

    const [membersRes, guestsRes] = await Promise.all([
      fetch(`${functionUrl}?file=members.json`),
      fetch(`${functionUrl}?file=guests.json`),
    ]);

    if (!membersRes.ok || !guestsRes.ok) {
      throw new Error("Failed to fetch rules from Azure Function.");
    }

    const [members, guests] = await Promise.all([
      membersRes.json(),
      guestsRes.json(),
    ]);

    return { members, guests };
  } catch (err) {
    console.warn(
      "Failed to fetch rules from Azure Function, falling back to local JSON.",
      err
    );
    return {
      members: memberRulesLocal,
      guests: guestRulesLocal,
    };
  }
}
