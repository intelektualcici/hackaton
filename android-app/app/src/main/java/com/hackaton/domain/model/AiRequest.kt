package com.hackaton.domain.model

data class AiRequest(
    val prompt: String,
    val mode: String = "default"
)
