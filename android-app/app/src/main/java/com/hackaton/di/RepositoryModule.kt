package com.hackaton.di

import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import com.hackaton.data.auth.AuthRepository
import com.hackaton.data.auth.FirebaseAuthRepository
import com.hackaton.data.functions.AiRepository
import com.hackaton.data.functions.FirebaseAiRepository
import com.hackaton.data.realtime.FirebaseRealtimeRepository
import com.hackaton.data.realtime.RealtimeRepository
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
abstract class RepositoryModule {
    @Binds
    @Singleton
    abstract fun bindAuthRepository(repository: FirebaseAuthRepository): AuthRepository

    @Binds
    @Singleton
    abstract fun bindRealtimeRepository(repository: FirebaseRealtimeRepository): RealtimeRepository

    @Binds
    @Singleton
    abstract fun bindAiRepository(repository: FirebaseAiRepository): AiRepository
}
