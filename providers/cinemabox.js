"use strict";

var BASE = "https://cinema.albox.co/api/v4";

var HEADERS = {
  "User-Agent": "Dalvik/2.1.0 (Linux; U; Android 13)",
  "Accept": "application/json",
  "Device-Id": "cinemabox-nuvio",
  "Device-Model": "Android",
  "Device-OS-Version": "13",
  "Device-Store": "google",
  "App-Version": "4.0.0",
  "X-Hide-Sensitive-Content": "false"
};

async function getJson(url) {
  var response = await fetch(url, {
    method: "GET",
    headers: HEADERS
  });

  if (!response.ok) {
    throw new Error("HTTP " + response.status);
  }

  return await response.json();
}

function normalizeTitle(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF]/g, "");
}

async function getStreams(tmdbId, mediaType, season, episode) {
  try {
    console.log("[CinemaBox] Request:", mediaType, tmdbId);

    /*
     * Nuvio passes a TMDB ID, but CinemaBox uses its own IDs.
     * Do not treat the TMDB ID as a CinemaBox ID.
     *
     * The current provider API signature does not expose a title
     * argument, so a reliable title-to-title match cannot be made here.
     */
    console.log(
      "[CinemaBox] Cannot safely match TMDB ID without a title lookup:",
      tmdbId
    );

    return [];
  } catch (error) {
    console.log("[CinemaBox] Error:", String(error));
    return [];
  }
}

module.exports = {
  getStreams: getStreams
};
