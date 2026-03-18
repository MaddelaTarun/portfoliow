const contactForm = document.getElementById('contact-form');
contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = {
        name: contactForm.name.value,
        email: contactForm.email.value,
        message: contactForm.message.value,
    };
    try {
        const response = await fetch('/send-message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        const result = await response.json();
        if (result.status === 'success') {
            document.getElementById('form-status').textContent = 'message delivered.';
            contactForm.reset();
        } else {
            document.getElementById('form-status').textContent = 'something went wrong. try again.';
        }
    } catch (err) {
        document.getElementById('form-status').textContent = 'could not connect to server.';
    }
});

// --- VINYL PLAYER: SINGLE TRACK (COFFIN NAILS) ---
let playing = false;
let paused = false;
let stopping = false;

// Place your audio file in the repo root (or adjust the path below)
const TRACK = {
    title: 'coffin nails',
    artist: 'mf doom',
    src: 'coffin-nails.mp3',
    cover: 'albumcover.jpg',
};

const audio = new Audio(TRACK.src);
audio.addEventListener('ended', () => {
    // When the song finishes, reset everything
    stopTrack({ fade: false });
});

function fadeOutAudio(durationMs = 5000, tickMs = 25) {
    const startVolume = audio.volume;
    if (startVolume <= 0) return Promise.resolve();

    const start = Date.now();
    return new Promise((resolve) => {
        const id = setInterval(() => {
            const t = Math.min(1, (Date.now() - start) / durationMs);
            // Smooth fade: ease-out curve (fast at first, very gentle at the end)
            const eased = 1 - Math.pow(1 - t, 3);
            audio.volume = Math.max(0, startVolume * (1 - eased));
            if (t >= 1) {
                clearInterval(id);
                resolve();
            }
        }, tickMs);

        // hard fallback: ensure resolve even if timers throttle weirdly
        setTimeout(() => {
            clearInterval(id);
            audio.volume = 0;
            resolve();
        }, durationMs + 150);
    });
}

function updateSongUI() {
    const img = document.getElementById('vinyl-img');
    img.classList.add('swapping');
    setTimeout(() => {
        img.src = TRACK.cover;
        img.classList.remove('swapping');
    }, 300);
    document.getElementById('navbar-song').textContent = TRACK.title + ' — ' + TRACK.artist;
}

function setPlayIcon(isPlaying) {
    const playBtn = document.getElementById('play-icon');
    if (playBtn) {
        playBtn.innerHTML = isPlaying
            ? '<rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>'
            : '<path d="M6 4l15 8-15 8z"/>';
    }
}

function updateVinylClasses() {
    const vinyl = document.getElementById('vinyl');
    if (!vinyl) return;
    vinyl.classList.toggle('playing', playing && !paused);
    vinyl.classList.toggle('paused', playing && paused);
}

// Clicking your profile/vinyl toggles play/stop of the single track
function handleClick() {
    if (!playing) {
        playing = true;
        paused = false;
        stopping = false;
        updateSongUI();
        audio.volume = 1;
        audio.currentTime = 0;
        audio.play();

        const needle = document.getElementById('needle');
        needle.classList.add('visible');
        setTimeout(() => needle.classList.add('on-record'), 50);
        document.getElementById('navbar-player').classList.add('visible');
        setPlayIcon(true);
        updateVinylClasses();
    } else {
        stopTrack();
    }
}

function togglePause() {
    if (!playing) return;
    paused = !paused;
    if (paused) {
        audio.pause();
    } else {
        audio.play();
    }
    setPlayIcon(!paused);
    updateVinylClasses();
}

async function stopTrack({ fade = true } = {}) {
    if (!playing || stopping) return;
    stopping = true;

    // Fade only if user-initiated stop (not natural end)
    if (fade && !audio.paused) {
        try {
            await fadeOutAudio(5000);
        } catch (_) {
            // ignore fade errors; we'll hard-stop below
        }
    }

    playing = false;
    paused = false;
    audio.pause();
    audio.currentTime = 0;
    audio.volume = 1;
    setPlayIcon(false);
    updateVinylClasses();
    snapToUpright();

    const needle = document.getElementById('needle');
    needle.classList.remove('on-record');
    document.getElementById('navbar-player').classList.remove('visible');

    setTimeout(() => {
        needle.classList.remove('visible');
        const img = document.getElementById('vinyl-img');
        img.classList.add('swapping');
        setTimeout(() => {
            img.src = 'your-photo1.jpg'; // Reverts to your main photo
            img.classList.remove('swapping');
        }, 300);
    }, 700);

    // allow immediate replay after UI starts resetting
    setTimeout(() => {
        stopping = false;
    }, 0);
}

function snapToUpright() {
    const vinyl = document.getElementById('vinyl');
    const style = window.getComputedStyle(vinyl);
    const matrix = new DOMMatrixReadOnly(style.transform);
    const angle = Math.round(Math.atan2(matrix.m21, matrix.m11) * (180 / Math.PI));
    const normalized = ((angle % 360) + 360) % 360;
    const remaining = normalized === 0 ? 0 : 360 - normalized;
    const duration = (remaining / 360) * 4;

    vinyl.style.animation = 'none';
    vinyl.style.transition = `transform ${duration}s linear`;
    vinyl.style.transform = `rotate(${normalized + remaining}deg)`;

    setTimeout(() => {
        vinyl.style.transition = '';
        vinyl.style.transform = '';
        vinyl.style.animation = '';
    }, duration * 1000 + 100);
}
