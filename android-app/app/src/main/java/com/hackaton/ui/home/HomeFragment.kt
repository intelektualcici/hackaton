package com.hackaton.ui.home

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
import com.hackaton.databinding.FragmentHomeBinding
import kotlinx.coroutines.launch

@AndroidEntryPoint
class HomeFragment : Fragment() {
    private var _binding: FragmentHomeBinding? = null
    private val binding get() = _binding!!
    private val viewModel: HomeViewModel by viewModels()

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentHomeBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        binding.saveDisplayNameButton.setOnClickListener {
            viewModel.saveDisplayName(binding.displayNameInput.text.toString())
        }
        binding.openAiButton.setOnClickListener {
            findNavController().navigate(R.id.action_homeFragment_to_aiFragment)
        }

        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.uiState.collect(::render)
            }
        }
    }

    private fun render(state: HomeUiState) {
        binding.homeProgressBar.isVisible = state.isLoading
        binding.uidText.text = state.uid
        if (binding.displayNameInput.text.toString() != state.displayName) {
            binding.displayNameInput.setText(state.displayName)
        }
        binding.homeStatusText.text = state.message.orEmpty()
        binding.homeStatusText.isVisible = state.message != null
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
