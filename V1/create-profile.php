<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Access form data
    $username = $_POST['username'];
    $aboutMe = $_POST['aboutMe'];
    $xmrAddress = $_POST['xmrAddress'];
    $btcAddress = $_POST['btcAddress'];
    $ltcAddress = $_POST['ltcAddress'];
    $ethAddress = $_POST['ethAddress'];
    $qrwAddress = $_POST['qrwAddress'];

    // Validate QRW address
    if (!preg_match('/^QRW[0-9]{15}$/', $qrwAddress)) {
        echo json_encode(['success' => false, 'message' => 'Invalid QRW address format']);
        exit;
    }

    // Validate and save profile picture
    if (isset($_FILES['profilePicture']) && $_FILES['profilePicture']['error'] == UPLOAD_ERR_OK) {
        $profilePicPath = 'uploads/' . basename($_FILES['profilePicture']['name']);
        move_uploaded_file($_FILES['profilePicture']['tmp_name'], $profilePicPath);
    } else {
        $profilePicPath = null;
    }

    // Validate and save banner image
    if (isset($_FILES['banner']) && $_FILES['banner']['error'] == UPLOAD_ERR_OK) {
        $bannerPath = 'uploads/' . basename($_FILES['banner']['name']);
        move_uploaded_file($_FILES['banner']['tmp_name'], $bannerPath);
    } else {
        $bannerPath = null;
    }

    // Generate profile URL
    $profileUrl = 'https://example.com/profiles/' . urlencode($username);

    // Save user data
    $profileData = [
        'username' => $username,
        'aboutMe' => $aboutMe,
        'xmrAddress' => $xmrAddress,
        'btcAddress' => $btcAddress,
        'ltcAddress' => $ltcAddress,
        'ethAddress' => $ethAddress,
        'qrwAddress' => $qrwAddress,
        'profilePicture' => $profilePicPath,
        'banner' => $bannerPath
    ];

    $filename = 'profiles/' . $username . '.json';
    if (file_put_contents($filename, json_encode($profileData))) {
        echo json_encode(['success' => true, 'profileUrl' => $profileUrl, 'profileData' => $profileData]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to save profile data']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}

    // Generate profile URL
    $profileUrl = 'https://example.com/profiles/' . urlencode($username);

    // Generate a new transaction for profile creation
    $newTxId = 'Tx_' . time() . '_' . $username;
    $blockchainData = json_decode(file_get_contents('blockchain_data.json'), true);
    $blockchainData['transactions'][] = [
        'id' => $newTxId,
        'type' => 'profile_creation',
        'username' => $username,
        'timestamp' => time()
    ];
    file_put_contents('blockchain_data.json', json_encode($blockchainData));

    // Generate QR code
    require_once('phpqrcode/qrlib.php');
    $qrCodePath = 'qrcodes/' . $username . '_qr.png';
    QRcode::png($profileUrl, $qrCodePath);

    echo json_encode([
        'success' => true, 
        'profileUrl' => $profileUrl,
        'qrCodeUrl' => $qrCodePath,
        'newTransaction' => $newTxId
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}
?>