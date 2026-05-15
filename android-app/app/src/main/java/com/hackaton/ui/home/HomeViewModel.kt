package com.hackaton.ui.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import com.hackaton.data.auth.AuthRepository
import com.hackaton.domain.model.UserProfile
import com.hackaton.domain.usecase.ObserveUserProfileUseCase
import com.hackaton.domain.usecase.SaveUserProfileUseCase
import com.hackaton.util.Result
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.launch
import javax.inject.Inject

data class HomeUiState(
    val isLoading: Boolean = true,
    val uid: String = "",
    val displayName: String = "",
    val message: String? = null
)

@HiltViewModel
class HomeViewModel @Inject constructor(
    private val authRepository: AuthRepository,
    private val observeUserProfile: ObserveUserProfileUseCase,
    private val saveUserProfile: SaveUserProfileUseCase
) : ViewModel() {
    private val _uiState = MutableStateFlow(HomeUiState())
    val uiState: StateFlow<HomeUiState> = _uiState.asStateFlow()

    private var currentProfile: UserProfile? = null

    init {
        observeProfile()
    }

    fun saveDisplayName(displayName: String) {
        val profile = currentProfile ?: return
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, message = null)
            val cleanedName = displayName.trim().ifBlank { "Anonymous" }
            when (val result = saveUserProfile(profile.copy(displayName = cleanedName))) {
                is Result.Success -> _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    message = "Saved."
                )
                is Result.Error -> _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    message = result.message
                )
            }
        }
    }

    private fun observeProfile() {
        val uid = authRepository.currentUserId
        if (uid == null) {
            _uiState.value = HomeUiState(isLoading = false, message = "User is not signed in.")
            return
        }

        viewModelScope.launch {
            observeUserProfile(uid)
                .catch { throwable ->
                    _uiState.value = HomeUiState(
                        isLoading = false,
                        uid = uid,
                        message = throwable.localizedMessage ?: "Could not load the profile."
                    )
                }
                .collect { profile ->
                    currentProfile = profile
                    _uiState.value = HomeUiState(
                        isLoading = false,
                        uid = uid,
                        displayName = profile?.displayName.orEmpty(),
                        message = if (profile == null) "Profile does not exist yet." else null
                    )
                }
        }
    }
}
