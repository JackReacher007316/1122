<?php
// PHP SPA Router & API Reverse Proxy
// Serves static files, proxies API calls to Node.js backend on port 3000, and routes React paths to index.html

// Polyfill getallheaders() if not available
if (!function_exists('getallheaders')) {
    function getallheaders() {
        $headers = [];
        foreach ($_SERVER as $name => $value) {
            if (substr($name, 0, 5) == 'HTTP_') {
                $headers[str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', substr($name, 5)))))] = $value;
            } elseif (in_array($name, ['CONTENT_TYPE', 'CONTENT_LENGTH'])) {
                $headers[str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', $name))))] = $value;
            }
        }
        return $headers;
    }
}

$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Dynamically compute the subdirectory where index.php resides
$scriptName = $_SERVER['SCRIPT_NAME']; // e.g. "/website-4d-f1-theme/index.php" or "/index.php"
$baseDir = dirname($scriptName); // e.g. "/website-4d-f1-theme" or "/"
$baseDir = str_replace('\\', '/', $baseDir);
if ($baseDir === '/') {
    $baseDir = '';
}

// Strip baseDir from request URI to get clean virtual route
$routePath = $requestUri;
if (!empty($baseDir) && strpos($requestUri, $baseDir) === 0) {
    $routePath = substr($requestUri, strlen($baseDir));
}

// Define where the backend Node server is running
$backendUrl = 'http://127.0.0.1:3000';

// 1. Route API requests: proxy to Node.js Express backend
if (strpos($routePath, '/api') === 0) {
    $targetUrl = $backendUrl . $routePath;
    if (isset($_SERVER['QUERY_STRING']) && $_SERVER['QUERY_STRING'] !== '') {
        $targetUrl .= '?' . $_SERVER['QUERY_STRING'];
    }
    
    // Setup CURL request to backend
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $targetUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $_SERVER['REQUEST_METHOD']);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    
    // Forward Request Headers
    $headers = [];
    foreach (getallheaders() as $name => $value) {
        // Skip host header to avoid backend server confusion
        if (strcasecmp($name, 'Host') === 0) {
            continue;
        }
        $headers[] = "$name: $value";
    }
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    
    // Forward Request Body (for POST, PUT, etc.)
    if ($_SERVER['REQUEST_METHOD'] !== 'GET' && $_SERVER['REQUEST_METHOD'] !== 'HEAD') {
        $body = file_get_contents('php://input');
        curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
    }
    
    // Get response and info
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
    
    curl_close($ch);
    
    // Send response back to client
    http_response_code($httpCode);
    if ($contentType) {
        header("Content-Type: $contentType");
    }
    echo $response;
    exit;
}

// 2. Serve static assets if we are using built-in PHP development server
$filePath = __DIR__ . $routePath;
if ($routePath !== '/' && $routePath !== '' && file_exists($filePath) && !is_dir($filePath)) {
    $ext = pathinfo($filePath, PATHINFO_EXTENSION);
    $mimeTypes = [
        'css'  => 'text/css',
        'js'   => 'application/javascript',
        'svg'  => 'image/svg+xml',
        'png'  => 'image/png',
        'jpg'  => 'image/jpeg',
        'jpeg' => 'image/jpeg',
        'gif'  => 'image/gif',
        'ico'  => 'image/x-icon',
        'json' => 'application/json',
        'woff' => 'font/woff',
        'woff2'=> 'font/woff2',
        'ttf'  => 'font/ttf'
    ];
    
    if (isset($mimeTypes[$ext])) {
        header("Content-Type: " . $mimeTypes[$ext]);
    }
    readfile($filePath);
    exit;
}

// 3. Fallback: serve React SPA shell index.html for client-side routing
header("Content-Type: text/html");
readfile(__DIR__ . '/index.html');
exit;
