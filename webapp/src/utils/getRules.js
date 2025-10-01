// src/utils/getRules.js
import memberRulesLocal from "../../app/rules/members.json";
import guestRulesLocal from "../../app/rules/guests.json";
import siteConfig from "@generated/docusaurus.config"; // Docusaurus config import

/**
 * Get member and guest rules based on environment.
 * - dev: returns local JSON
 * - prod: fetches from Azure storage using storageUrl + SAS from customFields
 */
export async function getRules() {
  // Grab storage info from Docusaurus config
  const { storageUrl, storageSas } = siteConfig.customFields;

  if (process.env.NODE_ENV === "development") {
    // Development: return local JSON
    console.log("Development mode: using local rules JSON.");
    return {
      members: memberRulesLocal,
      guests: guestRulesLocal,
    };
  }

  // Production: fetch from Azure storage
  try {
    console.log("Production mode: fetching rules from Azure storage.");
    if (!storageUrl) throw new Error("storageUrl not defined in customFields");

    const membersUrl = `${storageUrl}/members.json${storageSas ? `?${storageSas}` : ""}`;
    const guestsUrl = `${storageUrl}/guests.json${storageSas ? `?${storageSas}` : ""}`;

    const [membersRes, guestsRes] = await Promise.all([
      fetch(membersUrl),
      fetch(guestsUrl),
    ]);

    if (!membersRes.ok || !guestsRes.ok) {
      throw new Error("Failed to fetch rules from Azure storage.");
    }

    const [members, guests] = await Promise.all([
      membersRes.json(),
      guestsRes.json(),
    ]);

    return { members, guests };
  } catch (err) {
    console.warn(
      "Failed to fetch rules from Azure, falling back to local JSON.",
      err
    );
    return {
      members: memberRulesLocal,
      guests: guestRulesLocal,
    };
  }
}
