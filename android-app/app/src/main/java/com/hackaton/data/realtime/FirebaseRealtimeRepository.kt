package com.hackaton.data.realtime

import com.google.firebase.database.DatabaseError
import com.google.firebase.database.FirebaseDatabase
import com.google.firebase.database.ValueEventListener
import com.google.firebase.database.DataSnapshot
import com.hackaton.domain.model.UserProfile
import com.hackaton.util.Result
import com.hackaton.util.toUserProfileOrNull
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.tasks.await
import javax.inject.Inject

class FirebaseRealtimeRepository @Inject constructor(
    private val database: FirebaseDatabase
) : RealtimeRepository {
    private val usersRef = database.reference.child("users")

    override fun observeUserProfile(uid: String): Flow<UserProfile?> = callbackFlow {
        val userRef = usersRef.child(uid)
        val listener = object : ValueEventListener {
            override fun onDataChange(snapshot: DataSnapshot) {
                trySend(snapshot.toUserProfileOrNull())
            }

            override fun onCancelled(error: DatabaseError) {
                close(error.toException())
            }
        }

        userRef.addValueEventListener(listener)
        awaitClose { userRef.removeEventListener(listener) }
    }

    override suspend fun createUserProfileIfMissing(
        uid: String,
        displayName: String
    ): Result<UserProfile> = try {
        val userRef = usersRef.child(uid)
        val snapshot = userRef.get().await()
        val existingProfile = snapshot.toUserProfileOrNull()

        if (existingProfile != null) {
            Result.Success(existingProfile)
        } else {
            val now = System.currentTimeMillis()
            val profile = UserProfile(
                uid = uid,
                displayName = displayName,
                createdAt = now,
                updatedAt = now
            )
            userRef.setValue(profile).await()
            Result.Success(profile)
        }
    } catch (throwable: Throwable) {
        Result.Error(throwable)
    }

    override suspend fun saveUserProfile(profile: UserProfile): Result<Unit> = try {
        usersRef.child(profile.uid).setValue(profile.copy(updatedAt = System.currentTimeMillis())).await()
        Result.Success(Unit)
    } catch (throwable: Throwable) {
        Result.Error(throwable)
    }
}
