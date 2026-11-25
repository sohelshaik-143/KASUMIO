package com.kasumio.assessment.storage;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.*;
import java.nio.file.*;
import java.util.UUID;

/**
 * Local disk storage implementation.
 * Validates magic bytes, strips EXIF metadata through image re-encoding,
 * validates dimensions, and generates random storage keys.
 */
@Service
public class LocalStorageService implements StorageService {

    private static final Logger log = LoggerFactory.getLogger(LocalStorageService.class);

    private final Path storageRoot;

    public LocalStorageService(@Value("${kasumio.storage.local-dir:uploads/assessment-images}") String storageDir) {
        this.storageRoot = Paths.get(storageDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.storageRoot);
        } catch (IOException e) {
            throw new StorageException("Failed to initialize storage directory: " + this.storageRoot, e);
        }
    }

    @Override
    public String store(InputStream inputStream, String originalFilename, String contentType, long sizeBytes) {
        try {
            byte[] rawBytes = inputStream.readAllBytes();
            if (rawBytes.length == 0) {
                throw new StorageException("Cannot upload empty file.");
            }

            // 1. Magic bytes & security check
            ImageSecurityValidator.ValidatedFormat format = ImageSecurityValidator.validateAndDetect(
                    rawBytes, originalFilename, rawBytes.length
            );

            // 2. Decode image to strip EXIF and validate dimensions
            BufferedImage image = ImageIO.read(new ByteArrayInputStream(rawBytes));
            if (image == null) {
                // If WebP is not natively decoded by standard ImageIO, verify magic bytes were already confirmed
                if (format == ImageSecurityValidator.ValidatedFormat.WEBP) {
                    return saveRawWithRandomKey(rawBytes, format.getExtension());
                }
                throw new StorageException("Failed to decode image data.");
            }

            int width = image.getWidth();
            int height = image.getHeight();
            if (width < 10 || height < 10 || width > 4096 || height > 4096) {
                throw new StorageException("Image dimensions (" + width + "x" + height + ") are outside permitted bounds (10x10 to 4096x4096).");
            }

            // 3. Re-encode to strip EXIF metadata
            String formatName = format == ImageSecurityValidator.ValidatedFormat.PNG ? "png" : "jpg";
            String storageKey = UUID.randomUUID().toString() + format.getExtension();
            Path destination = storageRoot.resolve(storageKey).normalize();

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(image, formatName, baos);
            Files.write(destination, baos.toByteArray(), StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);

            return storageKey;
        } catch (StorageException se) {
            throw se;
        } catch (Exception e) {
            log.error("Failed to store image: {}", e.getMessage(), e);
            throw new StorageException("Image processing failed: " + e.getMessage(), e);
        }
    }

    private String saveRawWithRandomKey(byte[] bytes, String extension) throws IOException {
        String storageKey = UUID.randomUUID().toString() + extension;
        Path destination = storageRoot.resolve(storageKey).normalize();
        Files.write(destination, bytes, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
        return storageKey;
    }

    @Override
    public byte[] load(String storageKey) {
        try {
            validateKey(storageKey);
            Path filePath = storageRoot.resolve(storageKey).normalize();
            if (!Files.exists(filePath)) {
                throw new StorageException("File not found for key: " + storageKey);
            }
            return Files.readAllBytes(filePath);
        } catch (IOException e) {
            throw new StorageException("Failed to read file: " + storageKey, e);
        }
    }

    @Override
    public void delete(String storageKey) {
        try {
            validateKey(storageKey);
            Path filePath = storageRoot.resolve(storageKey).normalize();
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            log.warn("Failed to delete stored file {}: {}", storageKey, e.getMessage());
        }
    }

    @Override
    public boolean exists(String storageKey) {
        if (storageKey == null || storageKey.isBlank()) return false;
        Path filePath = storageRoot.resolve(storageKey).normalize();
        return Files.exists(filePath);
    }

    @Override
    public String copy(String sourceStorageKey) {
        try {
            validateKey(sourceStorageKey);
            Path sourcePath = storageRoot.resolve(sourceStorageKey).normalize();
            if (!Files.exists(sourcePath)) {
                return null;
            }
            String ext = sourceStorageKey.contains(".") ? sourceStorageKey.substring(sourceStorageKey.lastIndexOf(".")) : ".img";
            String newStorageKey = UUID.randomUUID().toString() + ext;
            Path destPath = storageRoot.resolve(newStorageKey).normalize();
            Files.copy(sourcePath, destPath, StandardCopyOption.REPLACE_EXISTING);
            return newStorageKey;
        } catch (IOException e) {
            log.error("Failed to copy stored file {}: {}", sourceStorageKey, e.getMessage());
            return null;
        }
    }

    private void validateKey(String storageKey) {
        if (storageKey == null || storageKey.contains("..") || storageKey.contains("/") || storageKey.contains("\\")) {
            throw new StorageException("Invalid storage key path traversal detected.");
        }
    }
}
