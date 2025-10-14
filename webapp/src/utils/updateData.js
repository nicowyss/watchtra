import siteConfig from "@generated/docusaurus.config";

export async function updateData(progressCallback, duration = 1 * 60 * 1000) {
  const { functionUrl } = siteConfig.customFields;

  // Progressbar starten, wenn Callback gesetzt ist
  if (progressCallback) progressCallback(0);

  // Optional: lokale Test-URL eintragen
  const localTestUrl =
    "https://localhost/api/api"; 
  const urlToCall =
    process.env.NODE_ENV === "development"
      ? buildFunctionUrl(localTestUrl, "m-fetch")
      : buildFunctionUrl(functionUrl, "m-fetch");

  // Progressbar simulieren
  if (progressCallback) {
    const start = Date.now();
    const interval = setInterval(() => {
      let percent = ((Date.now() - start) / duration) * 100;
      if (percent >= 100) {
        percent = 100;
        clearInterval(interval);
      }
      progressCallback(percent);
    }, 100);
  }

  try {
    console.log("Calling Azure Function (m-fetch) at", urlToCall);

    // Nur in Prod oder beim lokalen Test wirklich fetch ausführen
    if (process.env.NODE_ENV !== "development" || localTestUrl) {
      const res = await fetch(urlToCall, { method: "POST" });
      if (!res.ok)
        throw new Error(`Azure Function call failed with status ${res.status}`);
    } else {
      console.log("Dev mode: skipping actual Azure Function call");
    }

    console.log("✅ Update triggered successfully.");

    // Reload nach duration
    setTimeout(() => {
      window.location.reload();
    }, duration);
  } catch (err) {
    console.error("❌ Failed to trigger update via Azure Function:", err);
    alert("Update konnte nicht gestartet werden.");
  }
}

function buildFunctionUrl(baseUrl, path) {
  const cleanBase = baseUrl.replace(/\/+$/, ""); // remove trailing slashes
  const withoutDoubleApi = cleanBase.replace(/\/api$/, ""); // remove final /api if it exists
  return `${withoutDoubleApi}/${path}`;
}

