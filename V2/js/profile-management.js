// profile-management.js
export function initProfileManagement() {
    const bioForm = document.getElementById('bioForm');
    bioForm.addEventListener('submit', handleProfileSubmission);

    document.getElementById('profilePicture').addEventListener('change', function() {
        previewFile(this, document.getElementById('profilePicturePreview'));
    });

    document.getElementById('banner').addEventListener('change', function() {
        previewFile(this, document.getElementById('bannerPreview'));
    });
}

function handleProfileSubmission(event) {
    event.preventDefault();
    const formData = new FormData(this);

    fetch('create-profile.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            displayQRCode(data);
            addNewTransaction(data.newTransaction);
            alert('Profile created successfully! Scan the QR code to view your profile.');
        } else {
            alert('Profile creation failed: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while creating the profile.');
    });
}

function displayQRCode(data) {
    const paymentInfo = {
        address: data.profileData.qrwAddress,
        amount: '',
        label: data.profileData.username,
        message: 'Payment to ' + data.profileData.username
    };
    const paymentString = `qrw:${paymentInfo.address}?amount=${paymentInfo.amount}&label=${encodeURIComponent(paymentInfo.label)}&message=${encodeURIComponent(paymentInfo.message)}`;
    new QRCode(document.getElementById("qrCodeContainer"), paymentString);

    document.getElementById("profileUrl").textContent = data.profileUrl;
    document.getElementById("profileUrl").href = data.profileUrl;
}

function previewFile(input, previewElement) {
    const file = input.files[0];
    const reader = new FileReader();

    reader.onloadend = function() {
        if (file.type.startsWith("image/")) {
            previewElement.innerHTML = `<img src="${reader.result}" alt="Image preview">`;
        } else {
            previewElement.innerHTML = 'File not supported!';
        }
    }

    if (file) {
        reader.readAsDataURL(file);
    } else {
        previewElement.innerHTML = '';
    }
}