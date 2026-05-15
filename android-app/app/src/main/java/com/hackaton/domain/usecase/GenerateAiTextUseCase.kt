package com.hackaton.domain.usecase

import com.hackaton.data.functions.AiRepository
import com.hackaton.domain.model.AiRequest
import javax.inject.Inject

class GenerateAiTextUseCase @Inject constructor(
    private val aiRepository: AiRepository
) {
    suspend operator fun invoke(request: AiRequest) = aiRepository.generateText(request)
}
