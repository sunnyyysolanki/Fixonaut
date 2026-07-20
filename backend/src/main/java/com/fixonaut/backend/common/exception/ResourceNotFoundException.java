package com.fixonaut.backend.common.exception;

public class ResourceNotFoundException extends  RuntimeException {

    public ResourceNotFoundException(String message)
    {
        super(message);
    }
}
