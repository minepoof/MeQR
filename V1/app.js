document.getElementById('bioForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const formData = new FormData(this);

    fetch('create-profile.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const paymentInfo = {
                address: data.profileData.qrwAddress,
                amount: '', // Can be filled by user later
                label: data.profileData.username,
                message: 'Payment to ' + data.profileData.username
            };
            const paymentString = `qrw:${paymentInfo.address}?amount=${paymentInfo.amount}&label=${encodeURIComponent(paymentInfo.label)}&message=${encodeURIComponent(paymentInfo.message)}`;
            new QRCode(document.getElementById("qrCodeContainer"), paymentString);
            
            // Display profile URL
            document.getElementById("profileUrl").textContent = data.profileUrl;
            document.getElementById("profileUrl").href = data.profileUrl;
        } else {
            alert('Profile creation failed: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while creating the profile.');
    });
});

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

document.getElementById('profilePicture').addEventListener('change', function() {
    previewFile(this, document.getElementById('profilePicturePreview'));
});

document.getElementById('banner').addEventListener('change', function() {
    previewFile(this, document.getElementById('bannerPreview'));
});

function addressToByteArray(address) {
    const numericPart = address.slice(3); // Remove 'QRW' prefix
    const byteArray = new Uint8Array(15);
    for (let i = 0; i < 15; i++) {
        byteArray[i] = parseInt(numericPart.slice(i, i+1), 10);
    }
    return byteArray;
}

document.getElementById('bioForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const formData = new FormData(this);

    fetch('create-profile.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Display QR code
            document.getElementById('qrCodeContainer').innerHTML = `<img src="${data.qrCodeUrl}" alt="Profile QR Code">`;
            
            // Add new transaction to blockchain visualization
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
});

function addNewTransaction(txId) {
    nodes.push({ id: txId, group: 2 });
    links.push({ source: "Block 3", target: txId, value: 1 });

    // Update the graph
    simulation.nodes(nodes);
    simulation.force("link").links(links);
    simulation.alpha(1).restart();

    // Update SVG elements
    updateGraph();
}