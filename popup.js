const audioFileInput = document.getElementById('audioFile');
const statusDiv = document.getElementById('status');
const currentAudioDiv = document.getElementById('currentAudio');
const previewBtn = document.getElementById('previewBtn');
const resetBtn = document.getElementById('resetBtn');

const MAX_DURATION_SECONDS = 7;

chrome.storage.local.get('customAudioDataUrl', (result) => {
  if (result.customAudioDataUrl) {
    currentAudioDiv.textContent = 'Current: Custom audio';
    previewBtn.style.display = 'inline-block';
    resetBtn.style.display = 'inline-block';
  } else {
    currentAudioDiv.textContent = 'Current: No custom audio';
    previewBtn.style.display = 'none';
    resetBtn.style.display = 'none';
  }
});

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

      chrome.storage.local.set({ customAudioDataUrl: dataUrl }, () => {
        if (chrome.runtime.lastError) {
          setStatus('Failed to save: ' + chrome.runtime.lastError.message, 'error');
        } else {
          setStatus('Custom audio saved successfully!', 'success');
          currentAudioDiv.textContent = 'Current: Custom audio';
          previewBtn.style.display = 'inline-block';
          resetBtn.style.display = 'inline-block';
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

previewBtn.addEventListener('click', () => {
  chrome.storage.local.get('customAudioDataUrl', (result) => {
    if (result.customAudioDataUrl) {
      const audio = new Audio();
      audio.src = result.customAudioDataUrl;
      audio.play();
    }
  });
});

resetBtn.addEventListener('click', () => {
  chrome.storage.local.remove('customAudioDataUrl', () => {
    setStatus('Custom audio removed.', 'success');
    currentAudioDiv.textContent = 'Current: No custom audio';
    previewBtn.style.display = 'none';
    resetBtn.style.display = 'none';
    audioFileInput.value = '';
  });
});

function setStatus(message, type) {
  statusDiv.textContent = message;
  statusDiv.className = 'status ' + type;
}
