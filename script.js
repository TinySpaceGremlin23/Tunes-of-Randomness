// Toggle the navbar visibility
function toggleNav() {
    const topnav = document.getElementById("topnav");
    topnav.classList.toggle("show-nav");
}

// Close navbar if user clicks outside
document.addEventListener("click", function (event) {
    const topnav = document.getElementById("topnav");
    const toggleBtn = document.getElementById("toggleBtn");

    if (!topnav.contains(event.target) && event.target !== toggleBtn && topnav.classList.contains('show-nav')) {
        topnav.classList.remove("show-nav");
    }
});

// Attach the toggle event listener to the toggle button
const toggleBtn = document.getElementById("toggleBtn");
if (toggleBtn) {
    toggleBtn.addEventListener("click", toggleNav);
} else {
    console.warn("Toggle button not found.");
}

// Get music player elements
const playPauseBtn = document.getElementById("play-pause");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const songTitle = document.getElementById("song-title");
const songLength = document.getElementById("song-length");
const progressBar = document.getElementById("progress-bar"); // Updated ID
const volumeSlider = document.getElementById("volume-slider");
const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");

const audio = new Audio();
let isPlaying = false;
let playlist = [];
let currentSongIndex = 0;

// Fetch JSON data
async function loadPlaylist() {
    try {
        const response = await fetch('songs.json');
        const data = await response.json();

        console.log('Fetched Playlist:', data);

        playlist = data.songs || data;

        if (playlist.length > 0) {
            loadSong(0);
        } else {
            console.warn('Playlist is empty.');
        }
    } catch (error) {
        console.error('Error loading playlist:', error);
        alert('Failed to load playlist.');
    }
}

// Load the song details
function loadSong(index) {
    if (index >= 0 && index < playlist.length) {
        currentSongIndex = index;
        const song = playlist[currentSongIndex];

        console.log(`Loading song: ${song.title} from ${song.url}`);

        const songTitle = document.getElementById("song-title");
        if (songTitle) {
            songTitle.textContent = `Now Playing: ${song.title}`;
        }

        try {
            audio.src = encodeURI(song.url);
            audio.load();
        } catch (err) {
            console.error(`Error loading audio: ${err.message}`);
            alert("Unable to load the song.");
        }
    } else {
        console.error('Invalid song index');
    }
}

// Attempt to autoplay the song
function attemptAutoPlay() {
    audio
        .play()
        .then(() => {
            console.log(`Autoplaying: ${playlist[currentSongIndex].title}`);
            isPlaying = true;
            if (playPauseBtn) playPauseBtn.textContent = "⏸";
        })
        .catch((error) => {
            console.warn("Autoplay blocked:", error.message);
            alert("Autoplay failed. Please click the play button manually.");
        });
}

// Pause or resume playback
function togglePlayPause() {
    if (isPlaying) {
        audio.pause();
        isPlaying = false;
        if (playPauseBtn) playPauseBtn.textContent = "▶";
    } else {
        attemptAutoPlay();
    }
}

// Play the next song
function playNextSong() {
    currentSongIndex = (currentSongIndex + 1) % playlist.length;
    loadSong(currentSongIndex);
    attemptAutoPlay();
}

// Play the previous song
function playPrevSong() {
    currentSongIndex = (currentSongIndex - 1 + playlist.length) % playlist.length;
    loadSong(currentSongIndex);
    attemptAutoPlay();
}

// Auto-play next song when current song ends
audio.addEventListener("ended", playNextSong);

audio.addEventListener("timeupdate", () => {
    if (!isNaN(audio.duration)) {
        const currentTime = formatTime(audio.currentTime);
        const durationTime = formatTime(audio.duration);
        if (songLength) {
            songLength.textContent = `${currentTime} / ${durationTime}`;
        }
        updateProgressBar();
    }
});

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${minutes}:${secs}`;
}

function updateProgressBar() {
    if (audio.duration && progressBar) {
        progressBar.value = (audio.currentTime / audio.duration) * 100;
    }
}

if (progressBar) {
    progressBar.addEventListener("input", function (event) {
        const newTime = (event.target.value / 100) * audio.duration;
        audio.currentTime = newTime;
    });
} else {
    console.warn("Progress bar not found.");
}

if (volumeSlider) {
    volumeSlider.addEventListener("input", function (event) {
        audio.volume = event.target.value / 100;
    });
} else {
    console.warn("Volume slider not found.");
}

if (playPauseBtn) playPauseBtn.addEventListener("click", togglePlayPause);
if (prevBtn) prevBtn.addEventListener("click", playPrevSong);
if (nextBtn) nextBtn.addEventListener("click", playNextSong);

document.addEventListener("DOMContentLoaded", loadPlaylist);

if (searchButton && searchInput) {
    function searchSong() {
        const query = searchInput.value.toLowerCase().trim();
        const songIndex = playlist.findIndex(song => song.title.toLowerCase().includes(query));
        const notFoundMessage = document.getElementById("not-found-message");

        if (songIndex !== -1) {
            loadSong(songIndex);
            attemptAutoPlay();
            searchInput.value = "";
            if (notFoundMessage) notFoundMessage.style.display = "none";
        } else {
            if (notFoundMessage) notFoundMessage.style.display = "block";
        }
    }

    searchButton.addEventListener("click", searchSong);

    searchInput.addEventListener("keydown", function(event) {
        if (event.key === "Enter") searchSong();
    });

    searchInput.addEventListener("input", function () {
        const notFoundMessage = document.getElementById("not-found-message");
        if (notFoundMessage) notFoundMessage.style.display = "none";
    });
} else {
    console.warn("Search button or input not found.");
}

const themes = ["default", "sunset", "midnight", "forest", "summer-pastels", "space-mermaid"];

function switchTheme(theme) {
    document.body.classList.remove(...themes.map(t => `theme-${t}`));
    document.body.classList.add(`theme-${theme}`);
    if (themeDropdown) themeDropdown.value = theme; // Sync dropdown with current theme
}

function randomizeTheme() {
    const randomTheme = themes[Math.floor(Math.random() * themes.length)];
    switchTheme(randomTheme);
}

document.addEventListener("DOMContentLoaded", function () {
    randomizeTheme(); // Apply a random theme on page load
});

const themeDropdown = document.getElementById("theme-dropdown");

if (themeDropdown) {
    themeDropdown.addEventListener("change", function () {
        const selectedTheme = themeDropdown.value;
        switchTheme(selectedTheme);
    });
} else {
    console.warn("Theme dropdown not found.");
}
