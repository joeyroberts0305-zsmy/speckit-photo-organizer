// src/classifier.js
// Image classification using TensorFlow.js MobileNet

let model = null;

const CATEGORY_MAP = {
  // People
  person: 'people',
  people: 'people',
  man: 'people',
  woman: 'people',
  boy: 'people',
  girl: 'people',
  face: 'people',
  human: 'people',
  
  // Animals
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
  pet: 'animals',
  animal: 'animals',
  wildlife: 'animals',
  mammal: 'animals',
  fish: 'animals',
  insect: 'animals',
  butterfly: 'animals',
  
  // Plants
  plant: 'plants',
  tree: 'plants',
  flower: 'plants',
  rose: 'plants',
  daisy: 'plants',
  sunflower: 'plants',
  orchid: 'plants',
  potted: 'plants',
  vase: 'plants',
  garden: 'plants',
  leaf: 'plants',
  vegetation: 'plants',
  fern: 'plants',
  succulent: 'plants'
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
    
    // Classify the image - get top 5 predictions
    const predictions = await model.classify(img, 5);
    URL.revokeObjectURL(url);
    
    // Score each category based on all predictions
    const categoryScores = {
      people: 0,
      animals: 0,
      plants: 0,
      other: 0
    };
    
    for (const pred of predictions) {
      const className = pred.className.toLowerCase();
      const prob = pred.probability;
      
      // Check if this prediction maps to a category
      let matched = false;
      for (const [key, category] of Object.entries(CATEGORY_MAP)) {
        if (className.includes(key)) {
          categoryScores[category] += prob;
          matched = true;
          console.log(`  → ${pred.className}: ${Math.round(prob * 100)}% => ${category}`);
          break;
        }
      }
      
      if (!matched && prob > 0.1) {
        categoryScores.other += prob * 0.5; // lower weight for unmatched
      }
    }
    
    // Find the category with highest score
    let bestCategory = 'other';
    let bestScore = categoryScores.other;
    
    for (const [category, score] of Object.entries(categoryScores)) {
      if (score > bestScore && score > 0.15) { // minimum confidence threshold
        bestScore = score;
        bestCategory = category;
      }
    }
    
    console.log(`✓ Classified as: ${bestCategory} (confidence: ${Math.round(bestScore * 100)}%)`);
    return bestCategory;
  } catch (err) {
    console.error('Classification error:', err);
    return 'other';
  }
}
