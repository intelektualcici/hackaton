package com.hackaton.ui.ai

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import com.hackaton.domain.model.AiRequest
import com.hackaton.domain.usecase.GenerateAiTextUseCase
import com.hackaton.util.Result
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class AiUiState(
    val isLoading: Boolean = false,
    val responseText: String = "",
    val errorMessage: String? = null
)

@HiltViewModel
class AiViewModel @Inject constructor(
    private val generateAiText: GenerateAiTextUseCase
) : ViewModel() {
    private val _uiState = MutableStateFlow(AiUiState())
    val uiState: StateFlow<AiUiState> = _uiState.asStateFlow()

    fun generate(prompt: String) {
        val cleanedPrompt = prompt.trim()
        if (cleanedPrompt.isBlank()) {
            _uiState.value = _uiState.value.copy(errorMessage = "Enter a prompt.")
            return
        }

        viewModelScope.launch {
            _uiState.value = AiUiState(isLoading = true)
            when (val result = generateAiText(AiRequest(prompt = cleanedPrompt))) {
                is Result.Success -> _uiState.value = AiUiState(responseText = result.data.text)
                is Result.Error -> _uiState.value = AiUiState(errorMessage = result.message)
            }
        }
    }
}
