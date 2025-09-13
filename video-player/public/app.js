document.addEventListener('DOMContentLoaded', initApp);

const manifestUri = 'https://storage.googleapis.com/shaka-demo-assets/angel-one/dash.mpd';

async function initApp() {
    shaka.polyfill.installAll();

    if (shaka.Player.isBrowserSupported()) {
        await initPlayer();
    } else {
        console.error('Browser not supported!');
    }
}

async function initPlayer() {
    const video = document.getElementById('video');
    const container = document.getElementById('video-container');

    const player = new shaka.Player(video);

    // This configuration object controls which buttons appear.
    const uiConfig = {
        'addSeekBar': true,
        'addBigPlayButton': true,
        'controlPanelElements': [
            'play_pause',
            'time_and_duration',
            'spacer',
            'volume', // <-- ✅ This line adds the audio button. Make sure it's here.
            'fullscreen',
            'overflow_menu'
        ],
        'overflowMenuButtons': [
            'captions',
            'quality',
            'playback_rate'
        ]
    };

    const ui = new shaka.ui.Overlay(player, container, video);
    ui.configure(uiConfig);
    
    player.addEventListener('error', onErrorEvent);

    try {
        await player.load(manifestUri);
        console.log('The video has been loaded with all controls!');
        setupCustomControls(video);
    } catch (e) {
        onError(e);
    }
}

function setupCustomControls(video) {
    const rewindOverlay = document.getElementById('rewind-overlay');
    const forwardOverlay = document.getElementById('forward-overlay');
    const rewindButton = rewindOverlay.querySelector('.seek-button');
    const forwardButton = forwardOverlay.querySelector('.seek-button');

    const seek = (amount) => {
        video.currentTime += amount;
    };

    const animateSeek = (button) => {
        button.classList.add('is-active');
        setTimeout(() => {
            button.classList.remove('is-active');
        }, 500);
    };

    rewindOverlay.addEventListener('dblclick', () => {
        seek(-10);
        animateSeek(rewindButton);
    });

    forwardOverlay.addEventListener('dblclick', () => {
        seek(10);
        animateSeek(forwardButton);
    });

    document.addEventListener('keydown', (event) => {
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return;
        }
        switch (event.key) {
            case 'ArrowLeft':
                seek(-10);
                animateSeek(rewindButton);
                break;
            case 'ArrowRight':
                seek(10);
                animateSeek(forwardButton);
                break;
            case ' ':
                event.preventDefault();
                if (video.paused) {
                    video.play();
                } else {
                    video.pause();
                }
                break;
        }
    });
}

function onErrorEvent(event) {
    onError(event.detail);
}

function onError(error) {
    console.error('Error code', error.code, 'object', error);
}