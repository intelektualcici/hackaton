package com.hackaton.domain.model

data class UserProfile(
    val uid: String = "",
    val displayName: String = "",
    val createdAt: Long = 0L,
    val updatedAt: Long = 0L
)
