// DOM Elements
const uploadArea = document.getElementById('upload-area');
const fileInput = document.getElementById('file-input');
const predictBtn = document.getElementById('predict-btn');
const resultSection = document.getElementById('result');
const resultImage = document.getElementById('result-image');
const resultVideo = document.getElementById('result-video');
const countDisplay = document.getElementById('count');

// ✅ Event Delegation di Upload Area
uploadArea.addEventListener('click', (e) => {
    const target = e.target;

    if (target.classList.contains('try-again-btn')) {
        resetForm();
        return;
    }

    if (target.classList.contains('view-details')) {
        try {
            const resultData = JSON.parse(uploadArea.dataset.lastResult || '{}');
            if (resultData && resultData.count !== undefined) {
                showResultDetails(resultData);
            } else {
                showError('Data hasil tidak ditemukan');
            }
        } catch (err) {
            showError('Gagal memuat hasil sebelumnya');
        }
        return;
    }

    if (target === uploadArea) {
        fileInput.click();
    }
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length === 0) return;

    const file = e.target.files[0];
    const validImageTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const validVideoTypes = ['video/mp4', 'video/avi', 'video/quicktime'];

    if (!validImageTypes.includes(file.type) && !validVideoTypes.includes(file.type)) {
        showError('Format file tidak didukung. Gunakan JPG, PNG, atau MP4.');
        fileInput.value = '';
        return;
    }

    if (file.size > 10 * 1024 * 1024) {
        showError('Ukuran file terlalu besar. Maksimal 10MB.');
        fileInput.value = '';
        return;
    }

    predictBtn.disabled = false;

    if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
            uploadArea.innerHTML = `
                <img src="${event.target.result}" style="max-width: 100%; max-height: 200px; border-radius: 5px;">
                <p>${file.name}</p>
                <small>${(file.size / 1024 / 1024).toFixed(2)} MB</small>
            `;
        };
        reader.readAsDataURL(file);
    } else if (file.type.startsWith('video/')) {
        uploadArea.innerHTML = `
            <i class="fas fa-video"></i>
            <p>${file.name}</p>
            <small>${(file.size / 1024 / 1024).toFixed(2)} MB</small>
            <p>Video siap diproses</p>
        `;
    }
});

predictBtn.addEventListener('click', async () => {
    const file = fileInput.files[0];
    if (!file) {
        showError('Silakan pilih file terlebih dahulu');
        return;
    }

    setLoadingState(file.name);

    try {
        const result = await processPrediction(file);
        displayFinalResult(result);
    } catch (error) {
        console.error('Prediction error:', error);
        showError(error.message || 'Terjadi kesalahan saat memproses file');
    } finally {
        resetPredictButton();
    }
});

function setLoadingState(filename) {
    predictBtn.disabled = true;
    predictBtn.textContent = 'Memproses...';
    uploadArea.innerHTML = `
        <div class="loading-state">
            <i class="fas fa-spinner fa-spin"></i>
            <h3>Memproses ${filename}</h3>
            <div class="progress-bar">
                <div class="progress"></div>
            </div>
            <p>Harap tunggu...</p>
        </div>
    `;
}

async function processPrediction(file) {
    const formData = new FormData();
    formData.append('file', file);

    const apiUrl = (location.hostname === 'localhost' || location.hostname === '127.0.0.1')
        ? 'http://localhost:5000/predict'
        : '/api/predict';

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            body: formData,
            headers: { 'Accept': 'application/json' },
            signal: controller.signal
        });

        clearTimeout(timeout);

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || `Error ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();

        if (!result || typeof result.count === 'undefined') {
            throw new Error('Format response tidak valid dari server');
        }

        return result;
    } catch (err) {
        clearTimeout(timeout);
        throw err;
    }
}

function displayFinalResult(result) {
    uploadArea.innerHTML = `
        <i class="fas fa-check-circle success-icon"></i>
        <h3>Prediksi Selesai!</h3>
        <p>${result.count} bebek terdeteksi</p>
        <button class="btn view-details">Lihat Detail</button>
        <button class="btn try-again-btn">Coba Lagi</button>
    `;

    uploadArea.dataset.lastResult = JSON.stringify(result);
}

function showResultDetails(result) {
    if (result.image_data) {
        resultImage.src = `data:image/jpeg;base64,${result.image_data}`;
        resultImage.style.display = 'block';
        resultVideo.style.display = 'none';
    }

    countDisplay.textContent = result.count;

    const detailsContainer = createDetectionDetailsElement();
    detailsContainer.innerHTML = '<h3>Detail Deteksi:</h3>';

    if (result.detections) {
        result.detections.forEach((det, i) => {
            const detElement = document.createElement('div');
            detElement.className = 'detection-item';
            detElement.innerHTML = `
                <p><strong>Bebek #${i + 1}:</strong></p>
                <p>Confidence: ${(det.confidence * 100).toFixed(1)}%</p>
                <p>Posisi: [${det.bbox.join(', ')}]</p>
            `;
            detailsContainer.appendChild(detElement);
        });
    }

    resultSection.style.display = 'block';
    resultSection.scrollIntoView({ behavior: 'smooth' });
}

function createDetectionDetailsElement() {
    let div = document.getElementById('detection-details');
    if (!div) {
        div = document.createElement('div');
        div.id = 'detection-details';
        div.className = 'detection-details';
        resultSection.appendChild(div);
    }
    return div;
}

function resetPredictButton() {
    predictBtn.textContent = 'Mulai Prediksi';
    predictBtn.disabled = false;
}

function showError(message) {
    uploadArea.innerHTML = `
        <div class="error-state">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>Terjadi Kesalahan</h3>
            <p>${message}</p>
            <button class="btn try-again-btn">Coba Lagi</button>
        </div>
    `;
}

function resetForm() {
    fileInput.value = '';
    uploadArea.innerHTML = `
        <i class="fas fa-cloud-upload-alt"></i>
        <h3>Seret & Lepaskan File di Sini</h3>
        <p>Atau klik untuk memilih file</p>
        <p>Format yang didukung: JPG, PNG, MP4, AVI</p>
    `;
    predictBtn.disabled = true;
    resultSection.style.display = 'none';

    const detailsContainer = document.getElementById('detection-details');
    if (detailsContainer) detailsContainer.innerHTML = '';

    document.getElementById('upload').scrollIntoView({ behavior: 'smooth' });
}

// Drag & Drop
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#FFA500';
    uploadArea.style.backgroundColor = '#fff8e1';
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.style.borderColor = '#ccc';
    uploadArea.style.backgroundColor = 'transparent';
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#ccc';
    uploadArea.style.backgroundColor = 'transparent';

    if (e.dataTransfer.files.length) {
        fileInput.files = e.dataTransfer.files;
        const event = new Event('change');
        fileInput.dispatchEvent(event);
    }
});

document.body.addEventListener('click', function (e) {
    if (e.target.classList.contains('try-again-btn')) {
        resetForm();
    }
});
