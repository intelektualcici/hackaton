package com.hackaton.ui.auth

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.core.view.isVisible
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import androidx.navigation.fragment.findNavController
import dagger.hilt.android.AndroidEntryPoint
import com.hackaton.R
import com.hackaton.databinding.FragmentAuthBinding
import kotlinx.coroutines.launch

@AndroidEntryPoint
class AuthFragment : Fragment() {
    private var _binding: FragmentAuthBinding? = null
    private val binding get() = _binding!!
    private val viewModel: AuthViewModel by viewModels()

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentAuthBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        binding.signInButton.setOnClickListener { viewModel.signIn() }

        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.uiState.collect(::render)
            }
        }

        viewModel.continueIfAlreadySignedIn()
    }

    private fun render(state: AuthUiState) {
        binding.authProgressBar.isVisible = state is AuthUiState.Loading
        binding.signInButton.isEnabled = state !is AuthUiState.Loading

        binding.authStatusText.text = when (state) {
            AuthUiState.Idle -> "Sign in anonymously to start."
            AuthUiState.Loading -> "Signing in..."
            is AuthUiState.SignedIn -> "Signed in: ${state.uid}"
            is AuthUiState.Error -> state.message
        }

        if (state is AuthUiState.SignedIn &&
            findNavController().currentDestination?.id == R.id.authFragment
        ) {
            findNavController().navigate(R.id.action_authFragment_to_homeFragment)
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
