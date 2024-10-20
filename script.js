const URL = "https://teachablemachine.withgoogle.com/models/6fGL2XjAU/";

        let model, webcam, labelContainer, maxPredictions;

        async function init() {
            const modelURL = URL + "model.json";
            const metadataURL = URL + "metadata.json";

            model = await tmImage.load(modelURL, metadataURL);
            maxPredictions = model.getTotalClasses();

            const flip = true; 
            webcam = new tmImage.Webcam(200, 200, flip); 
            await webcam.setup(); 
            await webcam.play();
            window.requestAnimationFrame(loop);

            // Clear previous webcam feed
            const webcamContainer = document.getElementById("webcam-container");
            webcamContainer.innerHTML = "";

            // Append the new webcam feed
            webcamContainer.appendChild(webcam.canvas);
            labelContainer = document.getElementById("label-container");
            labelContainer.innerHTML = "";  // Clear previous predictions

            for (let i = 0; i < maxPredictions; i++) { 
                labelContainer.appendChild(document.createElement("div"));
            }
        }

        async function loop() {
            webcam.update(); 
            await predict();
            window.requestAnimationFrame(loop);
        }

        async function predict() {
            const prediction = await model.predict(webcam.canvas);
            for (let i = 0; i < maxPredictions; i++) {
                const classPrediction =
                    prediction[i].className + ": " + (prediction[i].probability * 100).toFixed(2) + "%";
                labelContainer.childNodes[i].innerHTML = classPrediction;
            }
            
        }