package com.hackaton.data.realtime

import com.hackaton.domain.model.UserProfile
import com.hackaton.util.Result
import kotlinx.coroutines.flow.Flow

interface RealtimeRepository {
    fun observeUserProfile(uid: String): Flow<UserProfile?>

    suspend fun createUserProfileIfMissing(uid: String, displayName: String = "Anonymous"): Result<UserProfile>

    suspend fun saveUserProfile(profile: UserProfile): Result<Unit>
}
