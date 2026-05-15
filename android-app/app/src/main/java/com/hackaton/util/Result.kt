package com.hackaton.util

sealed interface Result<out T> {
    data class Success<T>(val data: T) : Result<T>
    data class Error(
        val throwable: Throwable? = null,
        val message: String = throwable?.localizedMessage ?: "An unexpected error occurred."
    ) : Result<Nothing>
}

inline fun <T, R> Result<T>.map(transform: (T) -> R): Result<R> = when (this) {
    is Result.Success -> Result.Success(transform(data))
    is Result.Error -> this
}
