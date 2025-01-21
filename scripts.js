// Toggle the navbar visibility
function toggleNav() {
  const topnav = document.getElementById("topnav");
  topnav.classList.toggle("show-nav");
}

// Close the navbar if the user clicks outside of it
document.addEventListener('click', function (event) {
  const topnav = document.getElementById("topnav");
  const toggleBtn = document.getElementById("toggleBtn");

  if (!topnav.contains(event.target) && event.target !== toggleBtn) {
    topnav.classList.remove("show-nav");
  }
});

// Get music player elements
const playPauseBtn = document.getElementById('play-pause');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const songTitle = document.getElementById('song-title');
const songLength = document.getElementById('song-length');
const progressBar = document.getElementById('progress');
const volumeSlider = document.getElementById('volume-slider');

// Theme elements
const dropdownContainer = document.getElementById('theme-dropdown');

const audio = new Audio(); // Use the Audio object for playback
let isPlaying = false;
let playlist = [];
let currentSongIndex = 0;

// Fetch songs from the songs.json file located in the project folder
fetch('songs.json') // Ensure your `songs.json` file is in the project folder
  .then(response => response.json())
  .then(data => {
    // Add songs from the JSON file to the playlist
    playlist = data;
    console.log('Loaded playlist:', playlist);

    // Shuffle the playlist
    shuffleSongs(playlist);

    if (playlist.length > 0) {
      currentSongIndex = 0; // Start with the first song in the shuffled playlist
      loadSong(currentSongIndex); // Load the first song

      // Automatically play the first song
      playCurrentSong();
    }
  })
  .catch(error => {
    console.error('Error loading songs.json:', error);
    alert('Unable to load the playlist. Please check the console for errors.');
  });

// Shuffle function (Fisher-Yates algorithm)
function shuffleSongs(songs) {
  for (let i = songs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));  // Random index
    [songs[i], songs[j]] = [songs[j], songs[i]];  // Swap elements
  }
}

// Load the song at the given index
function loadSong(index) {
  if (index < 0 || index >= playlist.length) {
    console.error("Invalid song index");
    return;
  }

  const song = playlist[index];
  songTitle.textContent = song.name || 'Unknown Title';
  songLength.textContent = '00:00 / 00:00';

  audio.src = song.url; // Set audio source to the new song's URL
  console.log("Trying to play URL:", song.url);

  audio.load(); // Reload the audio element with the new source
  audio.currentTime = 0; // Start at the beginning of the song
}

// Play the current song
function playCurrentSong() {
  if (audio.src && audio.src !== '') {
    audio.play()
      .then(() => {
        console.log(`Playing: ${playlist[currentSongIndex].name}`);
        isPlaying = true;
        playPauseBtn.textContent = 'll'; // Pause icon
      })
      .catch(error => {
        console.error('Error playing audio:', error);
        alert("Unable to play the song. Please try again.");
      });
  } else {
    console.error('No valid song source found.');
    alert("No valid song source found. Please check the song URLs.");
  }
}

// Pause or resume playback
function togglePlayPause() {
  if (isPlaying) {
    audio.pause();
    isPlaying = false;
    playPauseBtn.textContent = '▶'; // Play icon
  } else {
    playCurrentSong();
  }
}

// Play the next song in the playlist
function playNextSong() {
  currentSongIndex = (currentSongIndex + 1) % playlist.length;
  loadSong(currentSongIndex);
  playCurrentSong();
}

// Play the previous song in the playlist
function playPrevSong() {
  currentSongIndex = (currentSongIndex - 1 + playlist.length) % playlist.length;
  loadSong(currentSongIndex);
  playCurrentSong();
}

// Auto-play the next song when the current song ends
audio.addEventListener('ended', playNextSong);

// Update time and progress bar
audio.addEventListener('timeupdate', () => {
  const currentTime = formatTime(audio.currentTime);
  const durationTime = formatTime(audio.duration || 0);
  songLength.textContent = `${currentTime} / ${durationTime}`;
  updateProgressBar();
});

// Format time as minutes:seconds
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${secs}`;
}

// Update progress bar
function updateProgressBar() {
  if (audio.duration) {
    progressBar.value = (audio.currentTime / audio.duration) * 100;
  }
}

// Seek through the song
progressBar.addEventListener('input', function (event) {
  const newTime = (event.target.value / 100) * audio.duration;
  audio.currentTime = newTime;
});

// Adjust volume
volumeSlider.addEventListener('input', function (event) {
  audio.volume = event.target.value / 100;
});

// Add search functionality
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const notFoundMessage = document.getElementById('not-found-message');

// Add an event listener for when the user types or clears the search input
searchInput.addEventListener('input', function() {
  notFoundMessage.style.display = 'none';
});

function searchSong() {
  const searchTerm = searchInput.value.toLowerCase();
  const keywords = searchTerm.split(' ').filter(keyword => keyword.trim() !== '');

  if (keywords.length === 0) {
    notFoundMessage.style.display = 'none';
    return;
  }

  const foundSong = playlist.find(song => {
    return keywords.every(keyword => song.name.toLowerCase().includes(keyword));
  });

  if (foundSong) {
    currentSongIndex = playlist.indexOf(foundSong);
    loadSong(currentSongIndex);
    playCurrentSong();
    notFoundMessage.style.display = 'none';
    searchInput.value = '';
  } else {
    notFoundMessage.style.display = 'block';
  }
}

searchBtn.addEventListener('click', searchSong);
searchInput.addEventListener('keypress', event => {
  if (event.key === 'Enter') searchSong();
});

// Theme switching logic
dropdownContainer.addEventListener('change', function () {
  const selectedTheme = this.value;
  document.body.className = ''; // Reset all existing themes
  document.body.classList.add(`theme-${selectedTheme}`); // Apply the selected theme class
  localStorage.setItem('selectedTheme', selectedTheme);

  // Also update navbar gradient based on the selected theme
  const navbar = document.querySelector('.topnav');
  navbar.style.background = getComputedStyle(document.body).getPropertyValue('--navbar-gradient');
});

// On page load, apply the saved theme
const savedTheme = localStorage.getItem('selectedTheme');
if (savedTheme) {
  document.body.classList.add(`theme-${savedTheme}`);
  dropdownContainer.value = savedTheme; // Set the dropdown value to the saved theme
} else {
  document.body.classList.add('theme-default'); // Apply the default theme
  dropdownContainer.value = 'default'; // Set the dropdown value to "default"
}


// Event Listeners for player buttons
playPauseBtn.addEventListener('click', togglePlayPause);
prevBtn.addEventListener('click', playPrevSong);
nextBtn.addEventListener('click', playNextSong);
