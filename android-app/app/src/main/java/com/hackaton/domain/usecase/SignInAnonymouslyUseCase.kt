package com.hackaton.domain.usecase

import com.hackaton.data.auth.AuthRepository
import javax.inject.Inject

class SignInAnonymouslyUseCase @Inject constructor(
    private val authRepository: AuthRepository
) {
    suspend operator fun invoke() = authRepository.signInAnonymously()
}
