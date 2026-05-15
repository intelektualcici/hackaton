package com.hackaton.data.functions

import com.hackaton.domain.model.AiRequest
import com.hackaton.domain.model.AiResponse
import com.hackaton.util.Result

interface AiRepository {
    suspend fun generateText(request: AiRequest): Result<AiResponse>
}
