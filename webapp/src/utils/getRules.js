// src/utils/getRules.js
import memberRulesLocal from "../../app/rules/members.json";
import guestRulesLocal from "../../app/rules/guests.json";

// Example: If you want to eventually fetch from App Config, you can add it later
export async function getRules() {
  try {
    // TODO: Replace with actual App Configuration fetch logic
    // const response = await fetch("/api/rules"); 
    // if (response.ok) return await response.json();

    // For now, fallback immediately
    return {
      members: memberRulesLocal,
      guests: guestRulesLocal,
    };
  } catch (err) {
    console.warn("App Configuration not available, using local rules.", err);
    return {
      members: memberRulesLocal,
      guests: guestRulesLocal,
    };
  }
}
