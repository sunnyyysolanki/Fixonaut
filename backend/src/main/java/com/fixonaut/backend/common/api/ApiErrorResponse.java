package com.fixonaut.backend.common.api;

import java.util.Map;

public record ApiErrorResponse(
        Integer timestamp,
        int status,
        String code,
        String message,
        String path,
        Map<String,String> fieldErrors,
        String traceId
) {
}
