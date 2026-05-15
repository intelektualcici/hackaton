package com.hackaton.ui.ai

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
import com.hackaton.databinding.FragmentAiBinding
import kotlinx.coroutines.launch

@AndroidEntryPoint
class AiFragment : Fragment() {
    private var _binding: FragmentAiBinding? = null
    private val binding get() = _binding!!
    private val viewModel: AiViewModel by viewModels()

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentAiBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        binding.generateButton.setOnClickListener {
            viewModel.generate(binding.promptInput.text.toString())
        }
        binding.backButton.setOnClickListener { findNavController().navigateUp() }

        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.uiState.collect(::render)
            }
        }
    }

    private fun render(state: AiUiState) {
        binding.aiProgressBar.isVisible = state.isLoading
        binding.generateButton.isEnabled = !state.isLoading
        binding.aiErrorText.text = state.errorMessage.orEmpty()
        binding.aiErrorText.isVisible = state.errorMessage != null
        binding.aiResponseText.text = state.responseText
        binding.aiResponseText.isVisible = state.responseText.isNotBlank()
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
