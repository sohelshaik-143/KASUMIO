package com.kasumio.assessment.storage;

import java.io.InputStream;

public interface StorageService {
    String store(InputStream inputStream, String originalFilename, String contentType, long sizeBytes);
    byte[] load(String storageKey);
    void delete(String storageKey);
    boolean exists(String storageKey);
    String copy(String sourceStorageKey);
}
