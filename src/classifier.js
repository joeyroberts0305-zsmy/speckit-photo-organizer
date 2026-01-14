// src/classifier.js
// Image classification using TensorFlow.js MobileNet

let model = null;

const CATEGORY_MAP = {
  person: 'people',
  people: 'people',
  dog: 'animals',
  cat: 'animals',
  bird: 'animals',
  horse: 'animals',
  sheep: 'animals',
  cow: 'animals',
  elephant: 'animals',
  bear: 'animals',
  zebra: 'animals',
  giraffe: 'animals',
  plant: 'plants',
  tree: 'plants',
  flower: 'plants',
  potted_plant: 'plants',
  vase: 'plants'
};

export async function initClassifier() {
  if (model) return model;
  
  try {
    // Load TensorFlow.js and MobileNet
    const script1 = document.createElement('script');
    script1.src = 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.11.0/dist/tf.min.js';
    document.head.appendChild(script1);
    
    await new Promise((resolve, reject) => {
      script1.onload = resolve;
      script1.onerror = reject;
    });
    
    const script2 = document.createElement('script');
    script2.src = 'https://cdn.jsdelivr.net/npm/@tensorflow-models/mobilenet@2.1.0/dist/mobilenet.min.js';
    document.head.appendChild(script2);
    
    await new Promise((resolve, reject) => {
      script2.onload = resolve;
      script2.onerror = reject;
    });
    
    // Wait a moment for globals to be available
    await new Promise(resolve => setTimeout(resolve, 100));
    
    model = await window.mobilenet.load();
    console.log('✓ Image classifier loaded');
    return model;
  } catch (err) {
    console.error('Failed to load classifier:', err);
    return null;
  }
}

export async function classifyImage(imageFile) {
  if (!model) {
    await initClassifier();
  }
  
  if (!model) {
    return 'other'; // fallback if model fails to load
  }
  
  try {
    // Create an image element from the file
    const img = document.createElement('img');
    const url = URL.createObjectURL(imageFile);
    
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = url;
    });
    
    // Classify the image
    const predictions = await model.classify(img);
    URL.revokeObjectURL(url);
    
    // Map predictions to our categories
    for (const pred of predictions) {
      const className = pred.className.toLowerCase();
      for (const [key, category] of Object.entries(CATEGORY_MAP)) {
        if (className.includes(key)) {
          console.log(`Classified as ${category} (${pred.className}: ${Math.round(pred.probability * 100)}%)`);
          return category;
        }
      }
    }
    
    console.log(`Classified as other (${predictions[0].className}: ${Math.round(predictions[0].probability * 100)}%)`);
    return 'other';
  } catch (err) {
    console.error('Classification error:', err);
    return 'other';
  }
}
