package com.hackaton.data.functions

import com.google.firebase.functions.FirebaseFunctions
import com.hackaton.domain.model.AiRequest
import com.hackaton.domain.model.AiResponse
import com.hackaton.util.Result
import kotlinx.coroutines.tasks.await
import javax.inject.Inject

class FirebaseAiRepository @Inject constructor(
    private val functions: FirebaseFunctions
) : AiRepository {
    override suspend fun generateText(request: AiRequest): Result<AiResponse> = try {
        val payload = mapOf(
            "prompt" to request.prompt,
            "mode" to request.mode
        )
        val result = functions
            .getHttpsCallable("generateAiText")
            .call(payload)
            .await()

        val data = result.getData() as? Map<*, *> ?: error("Cloud Function did not return an object.")
        val text = data["text"] as? String ?: error("Cloud Function did not return text.")
        val createdAt = (data["createdAt"] as? Number)?.toLong() ?: System.currentTimeMillis()

        Result.Success(AiResponse(text = text, createdAt = createdAt))
    } catch (throwable: Throwable) {
        Result.Error(throwable)
    }
}
