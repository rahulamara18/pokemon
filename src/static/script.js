const body = document.querySelector("body");

const getSongsData = async (songName) => {
  const url = `https://itunes.apple.com/search?term=${songName.replace(
    /\s+/g,
    "+"
  )}&media=music`;
  return fetch(url)
    .then((response) => response.json())
    .then((data) => {
      return data.results.map(
        ({
          trackName,
          artistName,
          artworkUrl100,
          trackTimeMillis,
          previewUrl,
          trackExplicitness,
        }) => ({
          trackName,
          artistName,
          artworkUrl100,
          trackTimeMillis,
          previewUrl,
          trackExplicitness,
        })
      );
    })
    .catch((error) => console.log(error));
};

const populateResults = async (
  songName,
  allowExplicit,
  maxDuration,
  applyFilters
) => {
  const resultsContainer = document.querySelector(".results");
  resultsContainer.innerHTML = "";
  let songsData = await getSongsData(songName);
  if (applyFilters) {
    if (!allowExplicit) {
      songsData = songsData.filter((songData) => {
        return songData.trackExplicitness !== "explicit";
      });
    }
    if (maxDuration) {
      songsData = songsData.filter((songData) => {
        return songData.trackTimeMillis < maxDuration * 60 * 1000;
      });
    }
  }
  if (songsData.length === 0) {
    let not_found_div = document.createElement("div");
    not_found_div.classList.add("not_found");
    not_found_div.textContent = "Sorry! No songs found.";
    resultsContainer.appendChild(not_found_div);
    return;
  }
  songsData.slice(0, 10).forEach((songData) => {
    let search_card = document.createElement("div");
    search_card.classList.add("search_card");

    let album_cover = document.createElement("div");
    album_cover.classList.add("album_cover");
    album_cover.style.backgroundImage = `url(${songData.artworkUrl100})`;

    let title = document.createElement("div");
    title.classList.add("title");
    title.textContent = songData.trackName;

    let subtitle = document.createElement("subtitle");
    subtitle.classList.add("subtitle");
    subtitle.textContent = songData.artistName;

    let audio = document.createElement("audio");
    audio.controls = "controls";
    audio.src = songData.previewUrl;

    search_card.append(album_cover, title, subtitle, audio);

    resultsContainer.appendChild(search_card);
  });
};

const isVisible = (el) => {
  let rect = el.getBoundingClientRect();

  return rect.top >= 0 && rect.bottom <= window.innerHeight;
};

const isInvisible = (el) => {
  let rect = el.getBoundingClientRect();

  return rect.top >= window.innerHeight || rect.bottom <= 0;
};

const onVisibilityChange = (el, onVisible, onInvisible) => {
  let oldVisible = true;
  let oldInvisible = true;
  return () => {
    let visible = isVisible(el);
    let invisible = isInvisible(el);

    if (!visible && !invisible) return;

    if (oldVisible && invisible) onInvisible();
    else if (oldInvisible && visible) setTimeout(onVisible, 150);

    oldVisible = visible;
    oldInvisible = invisible;
  };
};

const animateHeaders = () => {
  const headers = document.querySelectorAll(".header");
  headers.forEach((h) => {
    const final = h.textContent;
    let happening = false;
    const handler = onVisibilityChange(
      h,
      () => {
        h.textContent = final[0];
        if (happening) return;
        happening = true;
        const increment = (curPos) => {
          if (curPos == final.length) {
            happening = false;
          } else {
            h.textContent += final.charAt(curPos);
            setTimeout(increment.bind(null, curPos + 1), 69);
          }
        };
        increment(1);
      },
      () => {
        h.textContent = final[0];
      }
    );
    ["DOMContentLoaded", "load", "scroll", "resize"].forEach((ev) => {
      addEventListener(ev, handler, false);
    });
  });
};

const animateSearchBar = () => {
  const searchBarContainer = document.querySelector(".search_bar_container");
  const searchIcon = document.querySelector(".search_bar_container > svg");
  const searchBar = document.querySelector(".search_bar");
  searchBar.addEventListener("focus", () => {
    searchIcon.style.fill = "white";
    searchBarContainer.style.backgroundImage = `linear-gradient(rgb(10, 10, 10), rgb(10, 10, 10)), linear-gradient(175deg, var(--primary-desat) 10%, var(--secondary-desat) 80%)`;
  });

  searchBar.addEventListener("blur", () => {
    searchIcon.style.fill = "#757575";
    searchBarContainer.style.backgroundImage = "";
    searchBarContainer.style.backgroundColor = "rgb(20, 20, 20)";
  });
};

const animateInputs = () => {
  const reviewInputs = document.querySelectorAll(".review_input");
  reviewInputs.forEach((el) => {
    el.addEventListener("focus", () => {
      el.style.backgroundColor = "#0A0A0A";
    });

    el.addEventListener("blur", () => {
      el.style.backgroundColor = "rgb(20, 20, 20)";
    });
  });
};

animateInputs();
animateHeaders();

const windowName = window.location.pathname;

const isAlbumPage = /\/\w+\/\d+/;

if (windowName === "/search") {
  animateSearchBar();
  const inp = document.querySelector("input");
  const explicit_checkbox = document.querySelector(
    ".explicit_content_checkbox"
  );
  const max_duration_input = document.querySelector(".minutes");
  const apply_checkbox = document.querySelector(".apply_filters_checkbox");
  inp.addEventListener("keyup", ({ key }) => {
    if (key === "Enter") {
      (async () => {
        await populateResults(
          inp.value,
          explicit_checkbox.checked,
          max_duration_input.value,
          apply_checkbox.checked
        );
      })();
    }
  });
} else if (windowName === "/spotlight") {
  const form = document.querySelector("form");
  const table = document.querySelector("table");
  table.style.opacity = 0;
  form.addEventListener("submit", (e) => {
    table.style.opacity = 1;
    e.preventDefault();
    const formData = new FormData(e.target);
    const tableBody = document.querySelector("tbody");
    const row = document.createElement("tr");
    const nameNode = document.createElement("td");
    nameNode.textContent = formData.get("name");
    const reviewNode = document.createElement("td");
    reviewNode.textContent = formData.get("review");
    const ratingNode = document.createElement("td");
    if (formData.get("rate")) {
      ratingNode.textContent =
        formData.get("rate") == 1 ? `1 star` : `${formData.get("rate")} stars`;
    } else {
      ratingNode.textContent = "0 stars";
    }
    row.append(nameNode, reviewNode, ratingNode);
    tableBody.appendChild(row);
  });

  const endTime = new Date("30 June 2023 00:00");
  const countdownNode = document.querySelector(".countdown");
  const updateCounter = () => {
    const now = new Date().getTime();
    const diff = endTime - now;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    countdownNode.textContent = `New Song in ${days} days ${hours}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  updateCounter();
  setInterval(updateCounter, 1000);
} else if (isAlbumPage.test(windowName)) {
  const artistNameRegex = /\/.*\//;
  const artistName = windowName.match(artistNameRegex)[0].slice(1, -1);
  const albumID = parseInt(windowName.split("/").pop());

  let artistID = -1;
  switch (artistName) {
    case "5sos":
      artistID = 0;
      break;
    case "chainsmokers":
      artistID = 1;
      break;
    case "radwimps":
      artistID = 2;
      break;
    case "queen":
      artistID = 3;
      break;
    case "kitri":
      artistID = 4;
      break;
    default:
      artistID = -1;
  }

  const songButtons = document.querySelectorAll(".plus");
  songButtons.forEach((songButton) => {
    songButton.addEventListener("click", () => {
      const songTrack = songButton.parentNode.parentNode.parentNode;
      songTrack.classList.toggle("favourite");
      const songID = Array.from(songTrack.parentNode.children).indexOf(
        songTrack
      );
      fetch("/toggle_song", {
        method: "POST",
        body: JSON.stringify({
          artistID,
          albumID,
          songID,
        }),
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      });
    });
  });
} else if (windowName === "/playlist") {
  const minusButtons = document.querySelectorAll(".minus");
  minusButtons.forEach((minusButton) => {
    minusButton.addEventListener("click", () => {
      const currentTrack = minusButton.parentNode.parentNode.parentNode;
      const [artistID, albumID, songID] = currentTrack.dataset.id
        .split(" ")
        .map(Number);

      fetch("/toggle_song", {
        method: "POST",
        body: JSON.stringify({
          artistID,
          albumID,
          songID,
        }),
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      });
      currentTrack.remove();
    });
  });
}
