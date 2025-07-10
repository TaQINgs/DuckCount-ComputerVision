# 🦆 DuckCount - Computer Vision Project

DuckCount is a simple Computer Vision project designed to detect and count ducks in an image using the YOLOv8 model from Ultralytics. This project serves as a basic experiment in object detection using deep learning and image processing techniques.

---

## 📌 Features

- Automatically detects duck objects in an image
- Displays detection results with bounding boxes
- Implements YOLOv8 by Ultralytics
- Can be run locally or on Google Colab

---

## 🧠 Technologies Used

- Python 3.x
- Ultralytics (YOLOv8)
- OpenCV
- Google Colab
- Matplotlib

---

## 📁 Project Structure

```
DuckCount-ComputerVision/
├── datasets/               # Training and testing datasets
├── images/                 # Test images for detection
├── model/                  # YOLOv8 model files (.pt)
├── src/
│   └── detect_ducks.py     # Main duck detection script
├── duckcount.ipynb         # Colab notebook for exploration and demo
└── README.md               # Project documentation
```

---

## 🚀 How to Run the Project

### 🔧 1. Clone the Repository

```bash
git clone https://github.com/TaQINgs/DuckCount-ComputerVision.git
cd DuckCount-ComputerVision
```

### 📦 2. Install Dependencies

```bash
pip install ultralytics opencv-python matplotlib
```

Alternatively, you can use the `duckcount.ipynb` notebook directly on Google Colab.

### 🧪 3. Run the Detection Script

```bash
python src/detect_ducks.py --source images/test.jpg
```

> Make sure the model file (`.pt`) is located in the `model/` folder and referenced correctly in `detect_ducks.py`.

---

## 🖼️ Example Output

The detection results will display an image with bounding boxes like this:

![Sample Detection](images/sample_result.jpg)

---

## 📝 Additional Notes

- The dataset is prepared in YOLO format (images and `.txt` annotations)
- The YOLOv8 model can be retrained using the Ultralytics CLI or the provided notebook
- Test images can be added to the `images/` folder
- Custom-trained `.pt` models can be used to improve accuracy

---

## 🤝 Contributing

Contributions are welcome! Feel free to fork this repository and submit a pull request with new features, bug fixes, or documentation improvements.

---

## 📄 License

MIT License — feel free to use and modify for learning or personal experimentation.

---

Made with ❤️ by [TaQINgs](https://github.com/TaQINgs)
