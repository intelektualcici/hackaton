package com.hackaton.util

import com.google.firebase.database.DataSnapshot
import com.hackaton.domain.model.UserProfile

fun DataSnapshot.toUserProfileOrNull(): UserProfile? = getValue(UserProfile::class.java)

fun Throwable.toUserMessage(): String = localizedMessage ?: "Firebase call failed."
