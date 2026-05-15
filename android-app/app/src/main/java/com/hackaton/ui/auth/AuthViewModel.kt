package com.hackaton.ui.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import com.hackaton.data.auth.AuthRepository
import com.hackaton.domain.model.UserProfile
import com.hackaton.domain.usecase.SaveUserProfileUseCase
import com.hackaton.domain.usecase.SignInAnonymouslyUseCase
import com.hackaton.util.Result
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

sealed interface AuthUiState {
    data object Idle : AuthUiState
    data object Loading : AuthUiState
    data class SignedIn(val uid: String) : AuthUiState
    data class Error(val message: String) : AuthUiState
}

@HiltViewModel
class AuthViewModel @Inject constructor(
    private val authRepository: AuthRepository,
    private val signInAnonymously: SignInAnonymouslyUseCase,
    private val saveUserProfile: SaveUserProfileUseCase
) : ViewModel() {
    private val _uiState = MutableStateFlow<AuthUiState>(AuthUiState.Idle)
    val uiState: StateFlow<AuthUiState> = _uiState.asStateFlow()

    fun continueIfAlreadySignedIn() {
        val uid = authRepository.currentUserId ?: return
        _uiState.value = AuthUiState.SignedIn(uid)
    }

    fun signIn() {
        viewModelScope.launch {
            _uiState.value = AuthUiState.Loading
            when (val authResult = signInAnonymously()) {
                is Result.Success -> createProfileAndContinue(authResult.data)
                is Result.Error -> _uiState.value = AuthUiState.Error(authResult.message)
            }
        }
    }

    private suspend fun createProfileAndContinue(uid: String) {
        val profile = UserProfile(uid = uid, displayName = "Anonymous")
        when (val profileResult = saveUserProfile(profile, createIfMissing = true)) {
            is Result.Success -> _uiState.value = AuthUiState.SignedIn(uid)
            is Result.Error -> _uiState.value = AuthUiState.Error(profileResult.message)
        }
    }
}
