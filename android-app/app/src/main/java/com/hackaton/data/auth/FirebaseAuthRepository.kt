package com.hackaton.data.auth

import com.google.firebase.auth.FirebaseAuth
import com.hackaton.util.Result
import kotlinx.coroutines.tasks.await
import javax.inject.Inject

class FirebaseAuthRepository @Inject constructor(
    private val firebaseAuth: FirebaseAuth
) : AuthRepository {
    override val currentUserId: String?
        get() = firebaseAuth.currentUser?.uid

    override suspend fun signInAnonymously(): Result<String> = try {
        val existingUid = firebaseAuth.currentUser?.uid
        if (existingUid != null) {
            Result.Success(existingUid)
        } else {
            val authResult = firebaseAuth.signInAnonymously().await()
            val uid = authResult.user?.uid ?: error("Firebase did not return a user.")
            Result.Success(uid)
        }
    } catch (throwable: Throwable) {
        Result.Error(throwable)
    }
}
