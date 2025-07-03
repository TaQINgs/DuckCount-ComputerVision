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
uploadArea.addEventListener('click', () => fileInput.click());

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

// predictBtn.addEventListener('click', async () => {
//     const file = fileInput.files[0];
//     if (!file) {
//         showError('Silakan pilih file terlebih dahulu');
//         return;
//     }

//     predictBtn.disabled = true;
//     predictBtn.textContent = 'Memproses...';
    
//     showLoading(file.name);

//     const formData = new FormData();
//     formData.append('file', file);

//     try {
//         // Determine API URL based on environment
//         let apiUrl;
//         if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
//             apiUrl = 'http://localhost:5000/predict';
//         } else {
//             apiUrl = '/api/predict'; // Relative path for production
//         }

//         const response = await fetch(apiUrl, {
//             method: 'POST',
//             body: formData,
//             headers: {
//                 'Accept': 'application/json'
//             }
//         });

//         if (!response.ok) {
//             const error = await response.json().catch(() => ({}));
//             throw new Error(error.message || `Error ${response.status}: ${response.statusText}`);
//         }

//         const result = await response.json();
//         displayResult(result);

//     } catch (error) {
//         console.error('Prediction error:', error);
//         showError(error.message || 'Terjadi kesalahan saat memproses file');
//     } finally {
//         predictBtn.textContent = 'Mulai Prediksi';
//         predictBtn.disabled = false;
//     }
// });

// ... (kode sebelumnya tetap sama)

predictBtn.addEventListener('click', async () => {
    const file = fileInput.files[0];
    if (!file) return;

    predictBtn.disabled = true;
    predictBtn.textContent = 'Memproses...';
    showLoading(file.name);

    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('http://localhost:5000/predict', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(await response.text());
        }

        const result = await response.json();
        
        // Tampilkan gambar dengan bounding box
        resultImage.src = `data:image/jpeg;base64,${result.image_data}`;
        resultImage.style.display = 'block';
        resultVideo.style.display = 'none';
        
        // Tampilkan jumlah deteksi
        countDisplay.textContent = result.count;
        
        // Tampilkan detail deteksi
        displayDetectionDetails(result.detections);
        
        resultSection.style.display = 'block';

    } catch (error) {
        console.error('Error:', error);
        showError(error.message || 'Terjadi kesalahan saat memproses');
    } finally {
        predictBtn.textContent = 'Mulai Prediksi';
        predictBtn.disabled = false;
    }
});

function displayDetectionDetails(detections) {
    const detailsContainer = document.getElementById('detection-details') || 
                           createDetectionDetailsElement();
    
    detailsContainer.innerHTML = '<h3>Detail Deteksi:</h3>';
    
    detections.forEach((det, i) => {
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

function createDetectionDetailsElement() {
    const div = document.createElement('div');
    div.id = 'detection-details';
    div.className = 'detection-details';
    return div;
}

// ... (kode setelahnya tetap sama)


tryAgainBtn.addEventListener('click', resetForm);

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

// Helper Functions
function showLoading(filename) {
    uploadArea.innerHTML = `
        <div class="loading-state">
            <i class="fas fa-spinner fa-spin"></i>
            <h3>Memproses ${filename}</h3>
            <p>Harap tunggu...</p>
        </div>
    `;
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

    // Tambah event listener setelah DOM update
    document.querySelector('.try-again-btn').addEventListener('click', resetForm);
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

// async function displayResult(result) {
//     if (!result) {
//         throw new Error('Tidak ada hasil dari server');
//     }

//     countDisplay.textContent = result.count || 0;
    
//     try {
//         if (result.type === 'image') {
//             // For images, we can display the processed result
//             if (result.result_url) {
//                 // If server returns a URL to the processed image
//                 const imgResponse = await fetch(result.result_url);
//                 const imgBlob = await imgResponse.blob();
//                 resultImage.src = URL.createObjectURL(imgBlob);
//             } else {
//                 // Fallback to original image
//                 resultImage.src = URL.createObjectURL(fileInput.files[0]);
//             }
//             resultImage.style.display = 'block';
//             resultVideo.style.display = 'none';
//         } else if (result.type === 'video') {
//             // For videos, we'll display the original with count
//             resultVideo.src = URL.createObjectURL(fileInput.files[0]);
//             resultVideo.style.display = 'block';
//             resultImage.style.display = 'none';
//         }
        
//         resultSection.style.display = 'block';
//         resultSection.scrollIntoView({ behavior: 'smooth' });
        
//     } catch (error) {
//         console.error('Error displaying result:', error);
//         showError('Gagal menampilkan hasil prediksi');
//     }
// }

// async function displayResult(result) {
//     if (!result) {
//         throw new Error('Tidak ada hasil dari server');
//     }

//     countDisplay.textContent = result.count || 0;
    
//     try {
//         if (result.type === 'image') {
//             // Jika server mengirim gambar sebagai base64
//             if (result.image_data) {
//                 resultImage.src = `data:image/png;base64,${result.image_data}`;
//             } 
//             // Jika server mengirim URL
//             else if (result.result_url) {
//                 const imgResponse = await fetch(result.result_url);
//                 const imgBlob = await imgResponse.blob();
//                 resultImage.src = URL.createObjectURL(imgBlob);
//             }
//             // Fallback ke gambar asli (tanpa bounding box)
//             else {
//                 resultImage.src = URL.createObjectURL(fileInput.files[0]);
//                 showError('Gambar hasil tidak tersedia, menampilkan gambar asli');
//             }
            
//             resultImage.style.display = 'block';
//             resultVideo.style.display = 'none';
//         } 
//         else if (result.type === 'video') {
//             // Untuk video, tetap gunakan asli untuk saat ini
//             resultVideo.src = URL.createObjectURL(fileInput.files[0]);
//             resultVideo.style.display = 'block';
//             resultImage.style.display = 'none';
//         }
        
//         resultSection.style.display = 'block';
//         resultSection.scrollIntoView({ behavior: 'smooth' });
        
//     } catch (error) {
//         console.error('Error displaying result:', error);
//         showError('Gagal menampilkan hasil prediksi');
//     }
// }

function displayResult(result) {
    // Reset loading state pertama
    uploadArea.innerHTML = `
        <i class="fas fa-check-circle success-icon"></i>
        <h3>Prediksi Selesai!</h3>
        <p>${result.count} bebek terdeteksi</p>
        <button class="btn view-details">Lihat Detail</button>
    `;

    // Tambahkan event listener untuk tombol detail
    document.querySelector('.view-details').addEventListener('click', () => {
        resultSection.style.display = 'block';
        resultSection.scrollIntoView({ behavior: 'smooth' });
    });

    // Tampilkan gambar hasil
    if (result.image_data) {
        resultImage.src = `data:image/jpeg;base64,${result.image_data}`;
        resultImage.style.display = 'block';
        resultVideo.style.display = 'none';
    }

    // Update count
    countDisplay.textContent = result.count;
}