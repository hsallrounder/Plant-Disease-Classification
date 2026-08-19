document.getElementById('drag-drop-area').addEventListener('click', function() {
    document.getElementById('file-upload').click();
});

document.getElementById('file-upload').addEventListener('change', function(event) {
    handleFileUpload(event.target.files);
});

document.getElementById('drag-drop-area').addEventListener('dragover', function(event) {
    event.preventDefault();
    event.target.style.backgroundColor = '#e9f5ff';
});

document.getElementById('drag-drop-area').addEventListener('dragleave', function(event) {
    event.preventDefault();
    event.target.style.backgroundColor = '';
});

document.getElementById('drag-drop-area').addEventListener('drop', function(event) {
    event.preventDefault();
    event.target.style.backgroundColor = '';
    let files = event.dataTransfer.files;
    handleFileUpload(files);
});

function handleFileUpload(files) {
    if (files.length === 0) {
        return;
    }

    var formData = new FormData();
    formData.append('image', files[0]);

    var reader = new FileReader();
    reader.onload = function(e) {
        var previewImage = document.getElementById('preview-image');
        previewImage.src = e.target.result;
        previewImage.hidden = false;
        document.getElementById('drag-drop-text').hidden = true;
    };
    reader.readAsDataURL(files[0]);

    fetch('/predict_plant', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        displayPrediction(data);
    })
    .catch(error => {
        console.error('Error:', error);
        displayPrediction({ class: 'Error', confidence: 'Could not process the image.' });
    });
}

function resetDragDropArea() {
    var previewImage = document.getElementById('preview-image');
    previewImage.src = '';
    previewImage.hidden = true;
    document.getElementById('drag-drop-text').hidden = false;
    document.getElementById('file-upload').value = '';
    document.getElementById('prediction').innerHTML = '';
}

function displayPrediction(data) {
    var predictionDiv = document.getElementById('prediction');
    predictionDiv.style.backgroundColor = '#f8f9fa';
    predictionDiv.style.color = '#000';

    if (data.class && data.confidence) {
        predictionDiv.innerHTML = 'Class: ' + data.class + '<br>Confidence: ' + data.confidence + '%';
    } else {
        predictionDiv.innerHTML = 'Sorry, Currently we cannot identify this object.';
    }
}

// Detect page refresh and trigger the refresh route
window.addEventListener('beforeunload', function() {
    fetch('/refresh', {
        method: 'GET'
    })
    .then(response => {
        // Optionally, handle the response if needed
    })
    .catch(error => {
        console.error('Error:', error);
    });
});