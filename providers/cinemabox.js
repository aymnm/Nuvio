"use strict";

/*
 * CinemaBox Arabic Provider for Nuvio
 * Uses the CinemaBox API.
 */

var BASE = "https://cinema.albox.co/api/v4";

var HEADERS = {
    "User-Agent": "Dalvik/2.1.0 (Linux; U; Android 13)",
    "Device-Id": "nuvio-cinemabox-provider",
    "Device-Model": "Android",
    "Device-OS-Version": "13",
    "Device-Store": "google",
    "App-Version": "4.0.0",
    "X-Hide-Sensitive-Content": "false",
    "X-Local-Before": "0",
    "X-ISP-ID": "0",
    "Accept": "application/json"
};

function request(url) {
    return fetch(url, {
        method: "GET",
        headers: HEADERS
    }).then(function (response) {
        if (!response.ok) {
            throw new Error("HTTP " + response.status);
        }
        return response.json();
    });
}

function encode(value) {
    return encodeURIComponent(String(value || ""));
}

function getStreams(tmdbId, mediaType, season, episode, title) {
    /*
     * CinemaBox uses its own IDs, not TMDB IDs.
     * Therefore we search by the media title.
     */

    var searchTitle = title || "";

    if (!searchTitle) {
        console.log(
            "[CinemaBox] A title is required to search CinemaBox."
        );
        return Promise.resolve([]);
    }

    var searchUrl =
        BASE +
        "/search?page_size=25&page_number=1&term=" +
        encode(searchTitle);

    return request(searchUrl).then(function (data) {
        var results = data.results || [];

        var wantedType =
            mediaType === "tv" ? "SERIES" : "MOVIE";

        var matches = results.filter(function (item) {
            return item &&
                item.id != null &&
                String(item.type || "").toUpperCase() === wantedType;
        });

        if (!matches.length) {
            console.log(
                "[CinemaBox] No matching title found: " + searchTitle
            );
            return [];
        }

        /*
         * Select the first search result.
         * Exact title matching can be added after testing.
         */
        var item = matches[0];

        var playerUrl;

        if (mediaType === "tv") {
            if (!season || !episode) {
                return [];
            }

            return request(
                BASE + "/shows/shows/dynamic/" + item.id
            ).then(function (details) {
                var seasons = details.seasons || [];

                var selectedSeason = seasons.filter(function (s) {
                    return Number(s.season_number || s.number) ===
                        Number(season);
                })[0];

                if (!selectedSeason) {
                    throw new Error("Season not found");
                }

                var episodes = selectedSeason.episodes || [];

                var selectedEpisode = episodes.filter(function (e) {
                    return Number(e.episode_number || e.number) ===
                        Number(episode);
                })[0];

                if (!selectedEpisode) {
                    throw new Error("Episode not found");
                }

                playerUrl =
                    BASE +
                    "/shows/episodes/player/" +
                    selectedEpisode.id;

                return request(playerUrl);
            }).then(function (player) {
                return formatStreams(player);
            });
        }

        playerUrl =
            BASE + "/shows/episodes/player/" + item.id;

        return request(playerUrl).then(function (player) {
            return formatStreams(player);
        });
    }).catch(function (error) {
        console.log(
            "[CinemaBox] Error: " +
            (error && error.message ? error.message : String(error))
        );
        return [];
    });
}

function formatStreams(data) {
    var videos = data.videos || [];

    return videos.filter(function (video) {
        return video && video.url;
    }).map(function (video) {
        return {
            name: "CinemaBox AR",
            title: "CinemaBox " + (video.quality || "Auto"),
            url: video.url,
            quality: video.quality || "Unknown",
            headers: HEADERS
        };
    });
}

module.exports = {
    getStreams: getStreams
};
