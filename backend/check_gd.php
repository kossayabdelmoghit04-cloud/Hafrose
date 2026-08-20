<?php
echo phpversion() . PHP_EOL;
echo (extension_loaded('gd') ? 'GD: OK' : 'GD: MISSING') . PHP_EOL;
echo (extension_loaded('imagick') ? 'Imagick: OK' : 'Imagick: MISSING') . PHP_EOL;
if (extension_loaded('gd')) {
    $info = gd_info();
    echo 'WebP Support: ' . ($info['WebP Support'] ? 'YES' : 'NO') . PHP_EOL;
    echo 'JPEG Support: ' . ($info['JPEG Support'] ? 'YES' : 'NO') . PHP_EOL;
    echo 'PNG Support: ' . ($info['PNG Support'] ? 'YES' : 'NO') . PHP_EOL;
    echo 'GD version: ' . ($info['GD Version'] ?? 'unknown') . PHP_EOL;
}
