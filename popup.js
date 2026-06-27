const audioFileInput = document.getElementById('audioFile');
const statusDiv = document.getElementById('status');
const currentAudioDiv = document.getElementById('currentAudio');
const previewBtn = document.getElementById('previewBtn');
const resetBtn = document.getElementById('resetBtn');
const audioSection = document.getElementById('audioSection');
const audioEnabledToggle = document.getElementById('audioEnabled');
const autoAcceptToggle = document.getElementById('autoAccept');
const showHistoryToggle = document.getElementById('showHistory');
const showMaxLevelToggle = document.getElementById('showMaxLevel');
const showSuspiciousCommentsToggle = document.getElementById('showSuspiciousComments');
const hideAdsToggle = document.getElementById('hideAds');

const MAX_DURATION_SECONDS = 7;

const DEFAULTS = {
  audioEnabled: true,
  autoAccept: true,
  showHistory: true,
  showMaxLevel: true,
  showSuspiciousComments: true,
  hideAds: true,
};

function setAudioActive(active, fileName) {
  currentAudioDiv.textContent = active ? fileName || 'Custom audio' : 'No custom audio';
  previewBtn.style.display = active ? 'inline-block' : 'none';
  resetBtn.style.display = active ? 'inline-block' : 'none';
  document.querySelector('.upload-zone').style.display = active ? 'none' : '';
}

function setStatus(message, type) {
  statusDiv.textContent = message;
  statusDiv.className = type;
}

// Load all settings on open
chrome.storage.local.get(
  ['customAudioDataUrl', 'customAudioFileName', 'audioEnabled', 'autoAccept', 'showHistory', 'showMaxLevel', 'showSuspiciousComments', 'hideAds'],
  (result) => {
    const audioEnabled = result.audioEnabled !== undefined ? result.audioEnabled : DEFAULTS.audioEnabled;
    audioEnabledToggle.checked = audioEnabled;
    audioSection.style.display = audioEnabled ? 'flex' : 'none';
    setAudioActive(Boolean(result.customAudioDataUrl), result.customAudioFileName);

    autoAcceptToggle.checked = result.autoAccept !== undefined ? result.autoAccept : DEFAULTS.autoAccept;
    showHistoryToggle.checked = result.showHistory !== undefined ? result.showHistory : DEFAULTS.showHistory;
    showMaxLevelToggle.checked = result.showMaxLevel !== undefined ? result.showMaxLevel : DEFAULTS.showMaxLevel;
    showSuspiciousCommentsToggle.checked = result.showSuspiciousComments !== undefined ? result.showSuspiciousComments : DEFAULTS.showSuspiciousComments;
    hideAdsToggle.checked = result.hideAds !== undefined ? result.hideAds : DEFAULTS.hideAds;
  }
);

// Audio enabled toggle
audioEnabledToggle.addEventListener('change', () => {
  const enabled = audioEnabledToggle.checked;
  audioSection.style.display = enabled ? 'flex' : 'none';
  chrome.storage.local.set({ audioEnabled: enabled });
});

// Simple boolean toggles
autoAcceptToggle.addEventListener('change', () => {
  chrome.storage.local.set({ autoAccept: autoAcceptToggle.checked });
});
showHistoryToggle.addEventListener('change', () => {
  chrome.storage.local.set({ showHistory: showHistoryToggle.checked });
});
showMaxLevelToggle.addEventListener('change', () => {
  chrome.storage.local.set({ showMaxLevel: showMaxLevelToggle.checked });
});
showSuspiciousCommentsToggle.addEventListener('change', () => {
  chrome.storage.local.set({ showSuspiciousComments: showSuspiciousCommentsToggle.checked });
});
hideAdsToggle.addEventListener('change', () => {
  chrome.storage.local.set({ hideAds: hideAdsToggle.checked });
});

// Audio file upload
audioFileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  if (file.type !== 'audio/mpeg') {
    setStatus('Please select an MP3 file.', 'error');
    audioFileInput.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = (event) => {
    const dataUrl = event.target.result;
    const audio = new Audio();
    audio.src = dataUrl;

    audio.addEventListener('loadedmetadata', () => {
      if (audio.duration > MAX_DURATION_SECONDS) {
        setStatus(
          `Audio is ${audio.duration.toFixed(1)}s. Max allowed is ${MAX_DURATION_SECONDS}s.`,
          'error'
        );
        audioFileInput.value = '';
        return;
      }

      chrome.storage.local.set({ customAudioDataUrl: dataUrl, customAudioFileName: file.name }, () => {
        if (chrome.runtime.lastError) {
          setStatus('Failed to save: ' + chrome.runtime.lastError.message, 'error');
        } else {
          setStatus('Saved!', 'success');
          setAudioActive(true, file.name);
        }
      });
    });

    audio.addEventListener('error', () => {
      setStatus('Could not read audio file. Is it a valid MP3?', 'error');
      audioFileInput.value = '';
    });
  };

  reader.onerror = () => {
    setStatus('Failed to read file.', 'error');
  };

  reader.readAsDataURL(file);
});

// Preview
let previewAudio = null;
previewBtn.addEventListener('click', () => {
  chrome.storage.local.get('customAudioDataUrl', (result) => {
    if (result.customAudioDataUrl) {
      if (previewAudio) { previewAudio.pause(); previewAudio.currentTime = 0; }
      previewAudio = new Audio(result.customAudioDataUrl);
      previewAudio.play();
    }
  });
});

// Remove custom audio
resetBtn.addEventListener('click', () => {
  chrome.storage.local.remove(['customAudioDataUrl', 'customAudioFileName'], () => {
    setStatus('Audio removed.', 'success');
    setAudioActive(false);
    audioFileInput.value = '';
  });
});
