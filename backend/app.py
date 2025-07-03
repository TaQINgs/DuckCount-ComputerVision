# from flask import Flask, request, jsonify
# from flask_cors import CORS 
# from werkzeug.utils import secure_filename
# from ultralytics import YOLO
# import cv2
# import os
# import tempfile
# import base64

# app = Flask(__name__)
# CORS(app) 

# # Load model YOLO
# model = YOLO("../model/best2.pt")

# # Konfigurasi upload
# UPLOAD_FOLDER = tempfile.gettempdir()
# ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'mp4', 'avi', 'mov'}
# app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# def allowed_file(filename):
#     return '.' in filename and \
#            filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# # @app.route('/predict', methods=['POST'])
# # def predict():
# #     if 'file' not in request.files:
# #         return jsonify({'error': 'No file uploaded'}), 400
    
# #     file = request.files['file']
    
# #     if file.filename == '':
# #         return jsonify({'error': 'No selected file'}), 400
    
# #     if file and allowed_file(file.filename):
# #         filename = secure_filename(file.filename)
# #         filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
# #         file.save(filepath)
        
# #         try:
# #             if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
# #                 # Proses gambar
# #                 image = cv2.imread(filepath)
# #                 results = model(image)
# #                 jumlah_objek = len(results[0].boxes)
                
# #                 # Simpan hasil prediksi
# #                 result_path = os.path.join(app.config['UPLOAD_FOLDER'], 'result_' + filename)
# #                 cv2.imwrite(result_path, results[0].plot())
                
# #                 return jsonify({
# #                     'type': 'image',
# #                     'count': jumlah_objek,
# #                     'result_path': result_path
# #                 })
                
# #             elif filename.lower().endswith(('.mp4', '.avi', '.mov')):
# #                 # Proses video
# #                 cap = cv2.VideoCapture(filepath)
# #                 frame_counts = []
# #                 output_path = os.path.join(app.config['UPLOAD_FOLDER'], 'output_' + filename)
                
# #                 # Setup video writer
# #                 fourcc = cv2.VideoWriter_fourcc(*'mp4v')
# #                 out = cv2.VideoWriter(output_path, fourcc, 30.0, 
# #                                     (int(cap.get(3)), int(cap.get(4))))
                
# #                 while cap.isOpened():
# #                     ret, frame = cap.read()
# #                     if not ret:
# #                         break
                    
# #                     results = model(frame)
# #                     jumlah_objek = len(results[0].boxes)
# #                     frame_counts.append(jumlah_objek)
                    
# #                     # Tulis frame dengan bounding box
# #                     out.write(results[0].plot())
                
# #                 cap.release()
# #                 out.release()
                
# #                 avg_count = sum(frame_counts) // len(frame_counts)
                
# #                 return jsonify({
# #                     'type': 'video',
# #                     'count': avg_count,
# #                     'result_path': output_path
# #                 })
                
# #         except Exception as e:
# #             return jsonify({'error': str(e)}), 500
# #         finally:
# #             # Bersihkan file temporary
# #             if os.path.exists(filepath):
# #                 os.remove(filepath)
    
# #     return jsonify({'error': 'File type not allowed'}), 400

# @app.route('/predict', methods=['POST'])
# def predict():
#     if 'file' not in request.files:
#         return jsonify({'error': 'No file uploaded'}), 400
    
#     file = request.files['file']
    
#     if file.filename == '':
#         return jsonify({'error': 'No selected file'}), 400
    
#     if file and allowed_file(file.filename):
#         # Simpan file sementara
#         filename = secure_filename(file.filename)
#         temp_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
#         file.save(temp_path)
        
#         try:
#             if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
#                 # Proses gambar
#                 img = cv2.imread(temp_path)
#                 results = model(img)
                
#                 # Gambar dengan bounding box
#                 annotated_img = results[0].plot()  # Ini akan menambahkan bounding box
                
#                 # Simpan gambar hasil
#                 result_filename = f"annotated_{filename}"
#                 result_path = os.path.join(app.config['UPLOAD_FOLDER'], result_filename)
#                 cv2.imwrite(result_path, annotated_img)
                
#                 # Konversi ke base64 untuk dikirim ke frontend
#                 _, img_encoded = cv2.imencode('.png', annotated_img)
#                 img_base64 = base64.b64encode(img_encoded).decode('utf-8')
                
#                 return jsonify({
#                     'type': 'image',
#                     'count': len(results[0].boxes),
#                     'image_data': img_base64  # Mengirim gambar langsung sebagai base64
#                 })
                
#             elif filename.lower().endswith(('.mp4', '.avi', '.mov')):
#                 # Proses video (tetap sama seperti sebelumnya)
#                 ...
                
#         finally:
#             # Bersihkan file sementara
#             if os.path.exists(temp_path):
#                 os.remove(temp_path)
    
#     return jsonify({'error': 'Invalid file type'}), 400

# if __name__ == '__main__':
#     app.run(host='0.0.0.0', port=5000)

from flask import Flask, request, jsonify
import cv2
import numpy as np
import base64
from ultralytics import YOLO
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

# Load model YOLO
model = YOLO("../model/best2.pt")

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    # Read image file
    img_bytes = file.read()
    nparr = np.frombuffer(img_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    # Run YOLO prediction
    results = model(img)
    
    # Extract detection information
    detections = []
    for result in results:
        for box in result.boxes:
            x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
            conf = float(box.conf[0])
            cls = int(box.cls[0])
            
            detections.append({
                'class': result.names[cls],
                'confidence': conf,
                'bbox': [x1, y1, x2, y2]
            })

    # Draw bounding boxes
    annotated_img = results[0].plot()  # This automatically draws boxes with labels

    # Convert to base64
    _, img_encoded = cv2.imencode('.jpg', annotated_img)
    img_base64 = base64.b64encode(img_encoded).decode('utf-8')

    return jsonify({
        'detections': detections,
        'image_data': img_base64,
        'count': len(detections)
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)