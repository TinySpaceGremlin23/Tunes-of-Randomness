// Toggle the navbar visibility 
function toggleNav() {
    var topnav = document.getElementById("topnav");
    topnav.classList.toggle("show-nav");
}

// Close the navbar if the user clicks outside of it
document.addEventListener('click', function(event) {
    var topnav = document.getElementById("topnav");
    var toggleBtn = document.getElementById("toggleBtn");

    // Check if the click was outside the nav bar and toggle button
    if (!topnav.contains(event.target) && event.target !== toggleBtn) {
        topnav.classList.remove("show-nav"); // Close the nav bar
    }
});


// Get music player elements
const playPauseBtn = document.getElementById('play-pause');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const randomizeBtn = document.getElementById('randomize'); // Randomize button
const albumCover = document.getElementById('album-cover');
const songTitle = document.getElementById('song-title');
const songLength = document.getElementById('song-length');
const progressBar = document.getElementById('progress');
const volumeSlider = document.getElementById('volume-slider');

// Get elements for dynamic theme change
const playerContainer = document.querySelector('.player-container');
const controlButtons = document.querySelectorAll('#controls button');
const dropdownContainer = document.getElementById('color-scheme');
const welcomeText = document.querySelector('.introText');
const waterMark = document.querySelector('.watermark');
const topnav = document.getElementById('topnav');
const navLinks = document.querySelectorAll('.topnav ul li a');

// Get root element for updating CSS variables
const root = document.documentElement;

let songs = []; // Global variable to hold the song data
let currentSongIndex = 0;
let isPlaying = false;
const audio = new Audio();

// Fetch songs.json and initialize the player
async function fetchSongs() {
    try {
      const response = await fetch('songs.json');
      if (!response.ok) {
        throw new Error(`Failed to fetch songs data: ${response.statusText}`);
      }
      const songsData = await response.json();
      songs = songsData;
      console.log('Songs loaded:', songs);
      if (songs.length > 0) {
        loadRandomSong();
      } else {
        console.error("No songs found in the data.");
        alert("No songs available to play. Please check your songs.json file.");
      }
    } catch (error) {
      console.error('Error fetching songs:', error);
      alert("Failed to load songs. Please check your connection or songs.json file.");
    }
  }
  
  // Load and display the song details
  function loadSong(song) {
    songTitle.textContent = song.title || 'Unknown Title';
    songLength.textContent = '00:00 / ' + (song.length || '00:00');
  
    // Reset album cover only if necessary
    if (albumCover.src !== song.cover) {
      albumCover.src = ''; // Clear previous image
      albumCover.src = song.cover; // Set new cover
    }
  
    albumCover.onload = function () {
      console.log('Album cover loaded successfully.');
    };
  
    albumCover.onerror = function () {
      console.warn(`Image failed to load: ${song.cover}`);
      albumCover.src = 'images/default-cover.jpg'; // Fallback if not found
    };
  
    // Load audio source
    audio.src = song.file;
    audio.load();
    audio.currentTime = 0;
    progressBar.value = 0;
  
    // Wait for audio to be ready
    audio.addEventListener('canplaythrough', () => {
      console.log("Audio is ready to play.");
      playPauseBtn.disabled = false; // Enable play button
    }, { once: true });
  
    playPauseBtn.disabled = true; // Disable play button until audio is ready
    console.log(`Loaded song: ${song.title}`);
  }
  
  // Play or pause the song
  function playPauseSong() {
    if (isPlaying) {
      audio.pause();
      playPauseBtn.textContent = '▶'; // Play icon
    } else {
      audio.play()
        .then(() => {
          console.log('Audio is playing...');
          playPauseBtn.textContent = 'll'; // Pause icon
        })
        .catch((error) => {
          console.error('Error playing audio:', error);
          alert("Unable to play the song. Please try again.");
        });
    }
    isPlaying = !isPlaying;
  }
  
  // Go to the previous song
  function prevSong() {
    currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    loadSong(songs[currentSongIndex]);
    audio.play();
    isPlaying = true;
  }
  
  // Go to the next song
  function nextSong() {
    currentSongIndex = (currentSongIndex + 1) % songs.length;
    loadSong(songs[currentSongIndex]);
    audio.play();
    isPlaying = true;
  }
  
  // Load a random song
  function loadRandomSong() {
    if (songs.length === 0) return;
    currentSongIndex = Math.floor(Math.random() * songs.length);
    loadSong(songs[currentSongIndex]);
    console.log(`Random song loaded: ${songs[currentSongIndex].title}`);
  }
  
  // Update progress bar as the song plays
  function updateProgressBar() {
    if (audio.duration) {
      const progressPercent = (audio.currentTime / audio.duration) * 100;
      progressBar.value = progressPercent;
    }
  }
  
  // Seek through the song
  function setProgress(e) {
    const newTime = (e.target.value / 100) * audio.duration;
    audio.currentTime = newTime;
  }
  
  // Change the volume
  function changeVolume(e) {
    audio.volume = e.target.value / 100;
  }
  
  // Format time as minutes:seconds
  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${secs}`;
  }
  
  // Update current time and duration display
  audio.addEventListener('timeupdate', () => {
    const currentTime = formatTime(audio.currentTime);
    const durationTime = formatTime(audio.duration || 0);
    songLength.textContent = `${currentTime} / ${durationTime}`;
    updateProgressBar();
  });
  
  progressBar.addEventListener('input', setProgress);
  volumeSlider.addEventListener('input', changeVolume);
  audio.addEventListener('ended', nextSong);
  playPauseBtn.addEventListener('click', playPauseSong);
  prevBtn.addEventListener('click', prevSong);
  nextBtn.addEventListener('click', nextSong);
  
  // Fetch and load songs on page load
  window.addEventListener('load', async () => {
    await fetchSongs();
    console.log("Page loaded with a random song.");
  });
  
  // Search functionality
  const searchInput = document.getElementById('search-input');
  const searchBtn = document.getElementById('search-btn');
  const notFoundMessage = document.getElementById('not-found-message');
  
  function searchSong() {
    const searchTerm = searchInput.value.toLowerCase();
    const foundSong = songs.find(song => song.title.toLowerCase().includes(searchTerm));
    if (foundSong) {
      currentSongIndex = songs.indexOf(foundSong);
      loadSong(foundSong);
      audio.play();
      isPlaying = true;
      notFoundMessage.style.display = 'none';
      searchInput.value = '';
    } else {
      notFoundMessage.style.display = 'block';
    }
  }
  
  searchBtn.addEventListener('click', searchSong);
  
  searchInput.addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
      searchSong();
    }
  });
  
  searchInput.addEventListener('input', function () {
    if (searchInput.value.trim() === '') {
      notFoundMessage.style.display = 'none';
    }
  });
  
// ==========================
// Theme Switching Logic
// ==========================
dropdownContainer.addEventListener('change', function() {
    const selectedScheme = this.value;

    switch (selectedScheme) {
        case 'sunset':
            // Set theme colors for sunset
            document.body.style.backgroundImage = 'linear-gradient(180deg, #ff6f61, #ff9a8b)'; // Sunset colors
            playerContainer.style.backgroundColor = '#ffccbc'; // Soft peach
            topnav.style.backgroundImage = 'linear-gradient(180deg, #ff6f61, #ff9a8b)';
            dropdownContainer.style.background = '#ff9a8b'; // Update dropdown background color
            dropdownContainer.style.color = '#5d4037'; // Dropdown text color
            welcomeText.style.color = '#5d4037'; // Welcome text color
            waterMark.style.color = '#3e2723'; // Watermark color
            songTitle.style.color = '#5d4037'; // Set song title color for sunset theme
            songLength.style.color = '#5d4037'; // Set song length color for sunset theme
            root.style.setProperty('--song-title-color', '#5d4037'); // Set song title color variable
            progressBar.style.background = '#ff9a8b'; 
            volumeSlider.style.background = '#ff9a8b'; 
            // Update thumb color for sunset theme
            root.style.setProperty('--thumb-color', '#ffcc80'); // Light orange thumb color
            controlButtons.forEach(button => {
                button.style.background = '#ff6f61';
                button.style.color = '#fff';
            });
            navLinks.forEach(link => {
                link.style.color = '#fff'; // White text for links
                link.style.transition = 'color 0.3s'; // Transition for smooth hover
                link.addEventListener('mouseenter', () => {
                    link.style.color = '#ffccbc'; // Hover color
                });
                link.addEventListener('mouseleave', () => {
                    link.style.color = '#fff'; // Reset to normal color
                });
            });
            randomizeBtn.style.background = '#ff6f61'; // Randomize button color
            randomizeBtn.style.color = '#fff'; // Randomize button text color
            searchBtn.style.background = '#ff6f61'; // Search button background color
            searchBtn.style.color = '#fff'; // Search button text color
            break;
    
        case 'midnight':
            document.body.style.backgroundImage = 'linear-gradient(180deg, #1c1f26, #3c3f47)'; // Deep dark colors
            playerContainer.style.backgroundColor = '#2c3e50'; // Dark blue
            topnav.style.backgroundImage = 'linear-gradient(180deg, #1c1f26, #3c3f47)';
            dropdownContainer.style.background = '#34495e'; // Update dropdown background color
            dropdownContainer.style.color = '#ecf0f1'; // Dropdown text color
            welcomeText.style.color = '#ecf0f1'; // Welcome text color
            waterMark.style.color = '#bdc3c7'; // Watermark color
            songTitle.style.color = '#ecf0f1'; // Set song title color for midnight theme
            songLength.style.color = '#ecf0f1'; // Set song length color for midnight theme
            root.style.setProperty('--song-title-color', '#ecf0f1'); // Set song title color variable
            progressBar.style.background = '#34495e'; 
            volumeSlider.style.background = '#34495e'; 
            root.style.setProperty('--thumb-color', '#95a5a6'); // Gray thumb color
            controlButtons.forEach(button => {
                button.style.background = '#2c3e50';
                button.style.color = '#ecf0f1';
            });
            navLinks.forEach(link => {
                link.style.color = '#ecf0f1'; // Light text for links
                link.style.transition = 'color 0.3s';
                link.addEventListener('mouseenter', () => {
                    link.style.color = '#ecf0f1'; // Keep same color on hover
                });
                link.addEventListener('mouseleave', () => {
                    link.style.color = '#ecf0f1'; // Reset to normal color
                });
            });
            randomizeBtn.style.background = '#2c3e50'; // Randomize button color
            randomizeBtn.style.color = '#ecf0f1'; // Randomize button text color
            searchBtn.style.background = '#2c3e50'; // Search button background color
            searchBtn.style.color = '#ecf0f1'; // Search button text color
            break;
    
        case 'forest':
            document.body.style.backgroundImage = 'linear-gradient(180deg, #1b3e20, #004d00)'; // Much darker forest colors
            playerContainer.style.backgroundColor = '#2e7d32'; // Dark green
            topnav.style.backgroundImage = 'linear-gradient(180deg, #1b3e20, #004d00)';
            dropdownContainer.style.background = '#388e3c'; // Darker green for dropdown
            dropdownContainer.style.color = '#e0f2f1'; // Light color for better contrast
            welcomeText.style.color = '#e0f2f1'; // Light color for better contrast
            waterMark.style.color = '#e0f2f1'; // Light color for watermark
            songTitle.style.color = '#e0f2f1'; // Set song title color for forest theme
            songLength.style.color = '#e0f2f1'; // Set song length color for forest theme
            root.style.setProperty('--song-title-color', '#e0f2f1'); // Set song title color variable
            progressBar.style.background = '#388e3c'; 
            volumeSlider.style.background = '#388e3c'; 
            root.style.setProperty('--thumb-color', '#4caf50'); // Darker green thumb color
            controlButtons.forEach(button => {
                button.style.background = '#1b3e20'; // Darker button background
                button.style.color = '#e0f2f1'; // Light text color
            });
            navLinks.forEach(link => {
                link.style.color = '#e0f2f1'; // Light text for links
                link.style.transition = 'color 0.3s'; // Transition for smooth hover
                link.addEventListener('mouseenter', () => {
                    link.style.color = '#c8e6c9'; // Hover color
                });
                link.addEventListener('mouseleave', () => {
                    link.style.color = '#e0f2f1'; // Reset to light color
                });
            });
            randomizeBtn.style.background = '#1b3e20'; // Darker randomize button color
            randomizeBtn.style.color = '#e0f2f1'; // Light text color for button
            searchBtn.style.background = '#1b3e20'; // Darker search button background
            searchBtn.style.color = '#e0f2f1'; // Light search button text color
            break;
    
        case 'summer pastels':
            document.body.style.backgroundImage = 'linear-gradient(180deg, #ffc97f, #f0bbcd)'; // Summer pastel gradient
            playerContainer.style.backgroundColor = '#c9e7db'; // Soft pastel green for player container
            topnav.style.backgroundImage = 'linear-gradient(180deg, #ffc97f, #f0bbcd)';
            dropdownContainer.style.background = '#eb8291'; // Soft pastel pink for dropdown background
            dropdownContainer.style.color = '#f0bbcd'; // Light pink for dropdown text
            welcomeText.style.color = '#eb7777'; // Warm pastel red for welcome text
            waterMark.style.color = '#eb7777'; // Warm pastel red for watermark
            songTitle.style.color = '#eb7777'; // Set song title color for Summer Pastels theme
            songLength.style.color = '#eb7777'; // Set song length color for summer pastels theme
            root.style.setProperty('--song-title-color', '#eb7777'); // Set song title color variable
            progressBar.style.background = '#eb8291'; // Pink progress bar
            volumeSlider.style.background = '#eb8291'; // Same pastel pink for volume slider
            root.style.setProperty('--thumb-color', '#ffc97f'); // Soft pastel orange thumb color
            controlButtons.forEach(button => {
                button.style.background = '#eb7777'; // Warm pastel red for control buttons
                button.style.color = '#f0bbcd'; // Soft light pink text color
            });
            navLinks.forEach(link => {
                link.style.color = '#f0bbcd'; // Light pastel pink for navigation links
                link.style.transition = 'color 0.3s';
                link.addEventListener('mouseenter', () => {
                    link.style.color = '#ffc97f'; // Pastel orange on hover
                });
                link.addEventListener('mouseleave', () => {
                    link.style.color = '#f0bbcd'; // Reset to light pink color
                });
            });
            randomizeBtn.style.background = '#eb7777'; // Warm pastel red for randomize button
            randomizeBtn.style.color = '#f0bbcd'; // Light pastel pink text color
            searchBtn.style.background = '#eb7777'; // Warm pastel red for search button background
            searchBtn.style.color = '#f0bbcd'; // Light pastel pink for search button text
            break;
    
                case 'default':
                    document.body.style.backgroundImage = 'linear-gradient(180deg, #F3FEB8, #FFDE4D)'; // Background gradient
                    playerContainer.style.backgroundColor = '#F3FEB8'; // Light yellowish
                    topnav.style.backgroundImage = 'linear-gradient(180deg, #F3FEB8, #FFDE4D)'; // Top navigation gradient
                    dropdownContainer.style.background = '#FFB22C'; // Dropdown background (bright orange)
                    dropdownContainer.style.color = '#5d4037'; // Dropdown text color (dark brown)
                    welcomeText.style.color = '#FF4C4C'; // Welcome text color (red)
                    waterMark.style.color = '#5d4037'; // Watermark color (dark brown)
                    songTitle.style.color = '#FF4C4C'; // Song title color (red)
                    songLength.style.color = '#FF4C4C'; // Set song length color for default theme (red)
                    root.style.setProperty('--song-title-color', '#FF4C4C'); // Set song title color variable (red)
                    progressBar.style.background = '#F3FEB8'; // Progress bar background (light yellowish)
                    volumeSlider.style.background = '#FFDE4D'; // Slider thumb color (lemon yellow)
                    root.style.setProperty('--thumb-color', '#FFDE4D'); // Set slider thumb color variable (lemon yellow)
                    
                    // Update control buttons
                    controlButtons.forEach(button => {
                        button.style.background = '#F3FEB8'; // Button background (light yellowish)
                        button.style.color = '#FF4C4C'; // Button text color (red)
                    });
            
                    // Update navigation links
                    navLinks.forEach(link => {
                        link.style.color = '#5d4037'; // Dark brown text for links
                        link.style.transition = 'color 0.3s'; // Transition for smooth hover
                        
                        // Ensure hover effect works
                        link.addEventListener('mouseenter', () => {
                            link.style.color = '#FFB22C'; // Hover color (bright orange)
                        });
                        link.addEventListener('mouseleave', () => {
                            link.style.color = '#5d4037'; // Reset to normal color (dark brown)
                        });
                    });
                    
                    // Update randomize and search buttons
                    randomizeBtn.style.background = '#FFB22C'; // Randomize button color (bright orange)
                    randomizeBtn.style.color = 'white'; // Randomize button text color (white)
                    searchBtn.style.background = '#FFB22C'; // Search button background color (bright orange)
                    searchBtn.style.color = 'white'; // Search button text color (white)
                    break;     
                    
            case 'space mermaid':
                // Set theme colors for space mermaid
            document.body.style.backgroundImage = 'linear-gradient(180deg, #310949, #b82a48)'; 
            playerContainer.style.backgroundColor = '#fda750'; 
            topnav.style.backgroundImage = 'linear-gradient(180deg, #310949, #b82a48)'; 
            dropdownContainer.style.background = '#f97d4e'; // Update dropdown background color
            dropdownContainer.style.color = '#310949'; // Dropdown text color
            welcomeText.style.color = '#fda750'; // Welcome text color
            waterMark.style.color = '#f97d4e'; // Watermark color
            songTitle.style.color = '#310949'; // Set song title color for space mermaid theme
            songLength.style.color = '#310949'; // Set song length color for space mermaid theme
            root.style.setProperty('--song-title-color', '#310949'); // Set song title color variable
            progressBar.style.background = '#310949'; 
            volumeSlider.style.background = '#310949'; 
            // Update thumb color for space mermaid theme
            root.style.setProperty('--thumb-color', '#b82a48'); 
            controlButtons.forEach(button => {
                button.style.background = '#310949';
                button.style.color = '#fda750';
            });
            navLinks.forEach(link => {
                link.style.color = '#fda750'; // White text for links
                link.style.transition = 'color 0.3s'; // Transition for smooth hover
                link.addEventListener('mouseenter', () => {
                    link.style.color = '#721646'; // Hover color
                });
                link.addEventListener('mouseleave', () => {
                    link.style.color = '#fda750'; // Reset to normal color
                });
            });
            randomizeBtn.style.background = '310949'; // Randomize button color
            randomizeBtn.style.color = '#fda750'; // Randomize button text color
            searchBtn.style.background = '#310949'; // Search button background color
            searchBtn.style.color = '#fda750'; // Search button text color
            break;

    } 
    
});

// Add event listener for the randomize button
randomizeBtn.addEventListener('click', () => {
    loadRandomSong(); // Load a random song
    playPauseSong();  // Play the song after loading it
});



