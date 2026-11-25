package com.kasumio.assessment.storage;

import java.util.Arrays;

/**
 * Validates image security: magic bytes, rejected extensions (specifically SVGs),
 * and format conformance for PNG, JPEG, and WebP.
 */
public class ImageSecurityValidator {

    public static final long MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

    // Magic bytes
    private static final byte[] PNG_MAGIC = new byte[]{(byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A};
    private static final byte[] JPEG_MAGIC = new byte[]{(byte) 0xFF, (byte) 0xD8, (byte) 0xFF};
    private static final byte[] RIFF_MAGIC = new byte[]{'R', 'I', 'F', 'F'};
    private static final byte[] WEBP_MAGIC = new byte[]{'W', 'E', 'B', 'P'};

    public enum ValidatedFormat {
        PNG("image/png", ".png"),
        JPEG("image/jpeg", ".jpg"),
        WEBP("image/webp", ".webp");

        private final String mimeType;
        private final String extension;

        ValidatedFormat(String mimeType, String extension) {
            this.mimeType = mimeType;
            this.extension = extension;
        }

        public String getMimeType() { return mimeType; }
        public String getExtension() { return extension; }
    }

    public static ValidatedFormat validateAndDetect(byte[] headerBytes, String originalFilename, long sizeBytes) {
        if (sizeBytes > MAX_FILE_SIZE_BYTES) {
            throw new StorageException("Image file size exceeds maximum permitted limit of 5MB.");
        }
        if (headerBytes == null || headerBytes.length < 16) {
            throw new StorageException("Corrupt or empty image file.");
        }

        // SVG rejection check: reject by filename extension or content inspection
        if (originalFilename != null && originalFilename.toLowerCase().endsWith(".svg")) {
            throw new StorageException("SVG format is strictly forbidden due to security and script execution risks.");
        }
        String headerAscii = new String(headerBytes, 0, Math.min(headerBytes.length, 64)).toLowerCase();
        if (headerAscii.contains("<svg") || headerAscii.contains("<?xml") || headerAscii.contains("<!doctype svg")) {
            throw new StorageException("SVG image content detected and rejected.");
        }

        // Check PNG
        if (headerBytes.length >= 8 && startsWith(headerBytes, PNG_MAGIC)) {
            return ValidatedFormat.PNG;
        }

        // Check JPEG
        if (headerBytes.length >= 3 && startsWith(headerBytes, JPEG_MAGIC)) {
            return ValidatedFormat.JPEG;
        }

        // Check WebP (RIFF + WEBP at offset 8)
        if (headerBytes.length >= 12 && startsWith(headerBytes, RIFF_MAGIC)) {
            byte[] webpCheck = Arrays.copyOfRange(headerBytes, 8, 12);
            if (Arrays.equals(webpCheck, WEBP_MAGIC)) {
                return ValidatedFormat.WEBP;
            }
        }

        throw new StorageException("Unsupported image format. Only PNG, JPEG, and WebP images are permitted.");
    }

    private static boolean startsWith(byte[] data, byte[] prefix) {
        if (data.length < prefix.length) return false;
        for (int i = 0; i < prefix.length; i++) {
            if (data[i] != prefix[i]) return false;
        }
        return true;
    }
}
