package com.hackaton.domain.usecase

import com.hackaton.data.realtime.RealtimeRepository
import com.hackaton.domain.model.UserProfile
import com.hackaton.util.Result
import com.hackaton.util.map
import javax.inject.Inject

class SaveUserProfileUseCase @Inject constructor(
    private val realtimeRepository: RealtimeRepository
) {
    suspend operator fun invoke(
        profile: UserProfile,
        createIfMissing: Boolean = false
    ): Result<UserProfile> {
        return if (createIfMissing) {
            realtimeRepository.createUserProfileIfMissing(profile.uid, profile.displayName)
        } else {
            realtimeRepository.saveUserProfile(profile).map { profile.copy(updatedAt = System.currentTimeMillis()) }
        }
    }
}
