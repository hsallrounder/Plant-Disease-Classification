from flask import Flask, render_template, request, jsonify
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
import tensorflow as tf
import numpy as np
import os

app = Flask(__name__)

# Load the "plant.keras" model from the same directory as app.py
model = tf.keras.models.load_model('plant_model')

class_names = ['Cherry___Powdery_mildew',
 'Cherry___healthy',
 'Peach___Bacterial_spot',
 'Peach___healthy',
 'Pepper__bell___Bacterial_spot',
 'Pepper__bell___healthy',
 'Strawberry___Leaf_scorch',
 'Strawberry___healthy']

@app.route('/')
def index():
  return render_template('index.html')

@app.route('/predict_plant', methods=['POST'])
def predict_plant():
  try:
    img_file = request.files['image']
    if img_file:
      # Create the 'uploads' directory if it doesn't exist
      if not os.path.exists('uploads'):
        os.mkdir('uploads')
        
      img_path = os.path.join('uploads', img_file.filename)
      img_file.save(img_path)
      img = tf.keras.preprocessing.image.load_img(img_path, target_size=(256, 256))
      img_array = tf.keras.preprocessing.image.img_to_array(img)
      img_array = tf.expand_dims(img_array, 0)  # Create a batch

      predictions = model.predict(img_array)
      predicted_class = class_names[np.argmax(predictions[0])]
      confidence = round(100 * (np.max(predictions[0])), 2)
      
      response_data = {
        'class': predicted_class,
        'confidence': confidence
      }

      return jsonify(response_data)
    else:
      return jsonify({'error': 'No image file provided'}), 400
  except Exception as e:
    print(f"Error: {str(e)}")
    return jsonify({'error': str(e)}), 500

@app.route('/refresh', methods=['GET'])
def refresh():
  try:
    if os.path.exists('uploads'):
      for root, dirs, files in os.walk('uploads', topdown=False):
        for name in files:
          os.remove(os.path.join(root, name))
        for name in dirs:
          os.rmdir(os.path.join(root, name))
      os.rmdir('uploads')
      
    return render_template('index.html')
  except Exception as e:
    print(f"Error: {str(e)}")
    return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
  app.run(debug=True)
