const URL = "https://teachablemachine.withgoogle.com/models/vz589Memb/";

let model, webcam, labelContainer, maxPredictions;

// Load the Teachable Machine model on page load
async function loadModel() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    labelContainer = document.getElementById("label-container");
    labelContainer.innerHTML = ""; // Clear labels
    for (let i = 0; i < maxPredictions; i++) {
        labelContainer.appendChild(document.createElement("div"));
    }
}

// Initialize webcam feed with fixed size
async function initWebcam() {
    stopWebcam(); // Stop any running webcam
    hideUploadedImage(); // Hide uploaded image if any

    const flip = true;
    webcam = new tmImage.Webcam(320, 240, flip); // Set webcam to fixed size (320x240)
    await webcam.setup();
    await webcam.play();
    document.getElementById("webcam-container").appendChild(webcam.canvas);
    document.getElementById("webcam-container").style.display = 'block';

    window.requestAnimationFrame(webcamLoop);
}

// Loop for webcam feed
async function webcamLoop() {
    webcam.update();
    await predict(webcam.canvas);
    window.requestAnimationFrame(webcamLoop);
}

// Predict function for both webcam and uploaded images
async function predict(source) {
    const prediction = await model.predict(source);
    for (let i = 0; i < maxPredictions; i++) {
        const classPrediction =
            prediction[i].className + ": " + (prediction[i].probability * 100).toFixed(2) + "%";
        labelContainer.childNodes[i].innerHTML = classPrediction;
    }
}

// Handle image upload with cropping and resizing to fixed size
function uploadImage() {
    document.getElementById('imageInput').click();
}

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return; // If no file, exit

    const reader = new FileReader();
    reader.onload = function (e) {
        const img = new Image();
        img.onload = async function () {
            hideWebcam(); // Stop the webcam feed
            const canvas = document.getElementById('uploaded-image-container');
            const context = canvas.getContext('2d');
            canvas.width = 320;
            canvas.height = 240;

            // Resize and crop the image to fit within 320x240
            const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
            const x = (canvas.width / 2) - (img.width / 2) * scale;
            const y = (canvas.height / 2) - (img.height / 2) * scale;
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.drawImage(img, x, y, img.width * scale, img.height * scale);

            canvas.style.display = 'block';

            await predict(canvas); // No need to reload model here, it's already loaded

            // Reset the file input to allow for re-upload
            event.target.value = '';
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// Stop the webcam if it's running
function stopWebcam() {
    if (webcam) {
        webcam.stop();
        document.getElementById("webcam-container").style.display = 'none';
    }
}

// Hide uploaded image and clear canvas
function hideUploadedImage() {
    const canvas = document.getElementById('uploaded-image-container');
    canvas.style.display = 'none';
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
}

// Hide webcam and stop feed
function hideWebcam() {
    stopWebcam(); // Stop webcam feed if any
    const webcamContainer = document.getElementById('webcam-container');
    webcamContainer.style.display = 'none';
}

// Load the model once when the page loads
window.onload = loadModel;
