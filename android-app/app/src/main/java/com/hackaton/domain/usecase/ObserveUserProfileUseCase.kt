package com.hackaton.domain.usecase

import com.hackaton.data.realtime.RealtimeRepository
import javax.inject.Inject

class ObserveUserProfileUseCase @Inject constructor(
    private val realtimeRepository: RealtimeRepository
) {
    operator fun invoke(uid: String) = realtimeRepository.observeUserProfile(uid)
}
