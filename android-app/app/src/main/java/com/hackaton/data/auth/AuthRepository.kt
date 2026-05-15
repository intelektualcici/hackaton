package com.hackaton.data.auth

import com.hackaton.util.Result

interface AuthRepository {
    val currentUserId: String?

    suspend fun signInAnonymously(): Result<String>
}
