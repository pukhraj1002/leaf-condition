const URL = "https://teachablemachine.withgoogle.com/models/DXbwDydIK/";

        let model, labelContainer, maxPredictions;

        // Load the Teachable Machine model on page load
        async function loadModel() {
            const modelURL = URL + "model.json";
            const metadataURL = URL + "metadata.json";
            
            // Loading the model
            model = await tmImage.load(modelURL, metadataURL);
            maxPredictions = model.getTotalClasses();
            
            // Prepare label container to hold prediction results
            labelContainer = document.getElementById("label-container");
            labelContainer.innerHTML = ""; // Clear previous labels
            for (let i = 0; i < maxPredictions; i++) {
                labelContainer.appendChild(document.createElement("div"));
            }
        }

        // Handle image upload and process it
        function handleImageUpload(event) {
            const file = event.target.files[0];
            if (!file) {
                console.log("No file selected.");
                return; // Exit if no file is selected
            }

            const reader = new FileReader();
            reader.onload = function (e) {
                const img = new Image();
                img.onload = async function () {
                    // Draw the image on the canvas
                    const canvas = document.getElementById('uploaded-image-container');
                    const context = canvas.getContext('2d');
                    canvas.width = 320;
                    canvas.height = 240;

                    // Resize and crop the image to fit 320x240
                    const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
                    const x = (canvas.width / 2) - (img.width / 2) * scale;
                    const y = (canvas.height / 2) - (img.height / 2) * scale;
                    context.clearRect(0, 0, canvas.width, canvas.height);
                    context.drawImage(img, x, y, img.width * scale, img.height * scale);

                    canvas.style.display = 'block'; // Ensure the canvas is shown

                    // Call the predict function to get predictions
                    await predict(canvas);

                    // Clear the file input to allow a new upload
                    event.target.value = '';
                };
                img.src = e.target.result; // Set the source of the image to the file URL
            };
            reader.readAsDataURL(file); // Read the image file as a data URL
        }

        // Predict function for the uploaded image
        async function predict(source) {
            const prediction = await model.predict(source);
            
            // Update label container with prediction results
            for (let i = 0; i < maxPredictions; i++) {
                const classPrediction =
                    prediction[i].className + ": " + (prediction[i].probability * 100).toFixed(2) + "%";
                labelContainer.childNodes[i].innerHTML = classPrediction;
            }
        }

        // Load the model once the page is ready
        window.onload = loadModel;