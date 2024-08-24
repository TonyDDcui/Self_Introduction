document.getElementById('uploadButton').addEventListener('click', function() {
    const fileInput = document.getElementById('fileInput');
    const fileList = document.getElementById('fileList');
    const files = fileInput.files;

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();

        reader.onload = function(event) {
            const fileType = file.type.split('/')[0];
            const fileContainer = document.createElement('div');
            fileContainer.classList.add('file-container');

            if (fileType === 'image') {
                const img = document.createElement('img');
                img.src = event.target.result;
                fileContainer.appendChild(img);
            } else if (fileType === 'video') {
                const video = document.createElement('video');
                video.src = event.target.result;
                video.controls = true;
                fileContainer.appendChild(video);
            }

            fileList.appendChild(fileContainer);
        };

        reader.readAsDataURL(file);
    }
});