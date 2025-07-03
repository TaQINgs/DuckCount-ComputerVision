// DOM Elements
const uploadArea = document.getElementById('upload-area');
const fileInput = document.getElementById('file-input');
const predictBtn = document.getElementById('predict-btn');
const resultSection = document.getElementById('result');
const resultImage = document.getElementById('result-image');
const resultVideo = document.getElementById('result-video');
const countDisplay = document.getElementById('count');
const tryAgainBtn = document.getElementById('try-again-btn');

// Event Listeners
// uploadArea.addEventListener('click', () => fileInput.click());
uploadArea.addEventListener('click', (e) => {
    if (e.target === uploadArea) {
        fileInput.click();
    }
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        const file = e.target.files[0];
        
        // Validate file type
        const validImageTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        const validVideoTypes = ['video/mp4', 'video/avi', 'video/quicktime'];
        
        if (!validImageTypes.includes(file.type) && !validVideoTypes.includes(file.type)) {
            showError('Format file tidak didukung. Gunakan JPG, PNG, atau MP4.');
            fileInput.value = '';
            return;
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            showError('Ukuran file terlalu besar. Maksimal 10MB.');
            fileInput.value = '';
            return;
        }

        predictBtn.disabled = false;
        
        // Show preview
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
    }
});

predictBtn.addEventListener('click', async () => {
    const file = fileInput.files[0];
    if (!file) {
        showError('Silakan pilih file terlebih dahulu');
        return;
    }

    // Set loading state
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

// Helper Functions
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

    // Determine API URL based on environment
    let apiUrl;
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        apiUrl = 'http://localhost:5000/predict';
    } else {
        apiUrl = '/api/predict'; // Relative path for production
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            },
            signal: controller.signal
        });

        clearTimeout(timeout);

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || `Error ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        
        // Validate response structure
        if (!result || typeof result.count === 'undefined') {
            throw new Error('Format response tidak valid dari server');
        }

        return result;
    } catch (error) {
        clearTimeout(timeout);
        throw error;
    }
}

function displayFinalResult(result) {
    // Show success state
    uploadArea.innerHTML = `
        <i class="fas fa-check-circle success-icon"></i>
        <h3>Prediksi Selesai!</h3>
        <p>${result.count} bebek terdeteksi</p>
        <button class="btn view-details">Lihat Detail</button>
    `;

    // Add event listener for details button
    document.querySelector('.view-details').addEventListener('click', () => {
        showResultDetails(result);
    });

    // Store result for later display
    uploadArea.dataset.lastResult = JSON.stringify(result);
}

function showResultDetails(result) {
    // Display image with bounding boxes
    if (result.image_data) {
        resultImage.src = `data:image/jpeg;base64,${result.image_data}`;
        resultImage.style.display = 'block';
        resultVideo.style.display = 'none';
    }

    // Display count
    countDisplay.textContent = result.count;

    // Display detection details if available
    if (result.detections) {
        const detailsContainer = document.getElementById('detection-details') || 
                               createDetectionDetailsElement();
        
        detailsContainer.innerHTML = '<h3>Detail Deteksi:</h3>';
        
        result.detections.forEach((det, i) => {
            const detElement = document.createElement('div');
            detElement.className = 'detection-item';
            detElement.innerHTML = `
                <p><strong>Bebek #${i+1}:</strong></p>
                <p>Confidence: ${(det.confidence * 100).toFixed(1)}%</p>
                <p>Posisi: [${det.bbox.join(', ')}]</p>
            `;
            detailsContainer.appendChild(detElement);
        });
        
        resultSection.appendChild(detailsContainer);
    }

    // Show result section
    resultSection.style.display = 'block';
    resultSection.scrollIntoView({ behavior: 'smooth' });
}

function createDetectionDetailsElement() {
    const div = document.createElement('div');
    div.id = 'detection-details';
    div.className = 'detection-details';
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

    // Tes apakah tombol ada
    setTimeout(() => {
        const tryAgain = document.querySelector('.try-again-btn');
        if (tryAgain) {
            console.log('✅ Tombol ditemukan, memasang listener...');
            tryAgain.addEventListener('click', resetForm);
        } else {
            console.log('❌ Tombol Coba Lagi tidak ditemukan di DOM!');
        }
    }, 0);
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
    
    document.getElementById('upload').scrollIntoView({ behavior: 'smooth' });
}

// Drag and Drop functionality
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