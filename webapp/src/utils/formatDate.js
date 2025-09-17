function formatDate(dateInput) {
  const date = new Date(dateInput);
  return date
    .toLocaleString("de-CH", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false, // <-- 24h format
    })
    .replace(",", " -")
    .replace(/\//g, "."); // ensure dots instead of slashes
}

module.exports = { formatDate };
