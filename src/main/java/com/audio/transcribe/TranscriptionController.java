package com.audio.transcribe;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.ai.audio.transcription.*;
import org.springframework.ai.openai.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.client.RestTemplate;

import java.io.File;

@RestController
@RequestMapping("/api/transcribe")
@CrossOrigin(origins = {
        "https://ai-audio-transcribe-frontend.vercel.app",
        "https://ai-audio-transcribe-frontend-7en5tjb74-itsaryanjain1.vercel.app"
})public class TranscriptionController {

    private final OpenAiAudioTranscriptionModel transcriptionModel;
    private final RestTemplate restTemplate;           // ✅ Fix 3: single shared instance
    private final ObjectMapper objectMapper;

    @Value("${spring.ai.openai.api-key}")
    private String openAiApiKey;

    @Value("${groq.api.key}")
    private String groqApiKey;

    public TranscriptionController(
            OpenAiAudioTranscriptionModel transcriptionModel,
            RestTemplateBuilder restTemplateBuilder     // ✅ Fix 3: injected via builder
    ) {
        this.transcriptionModel = transcriptionModel;
        this.restTemplate = restTemplateBuilder.build();
        this.objectMapper = new ObjectMapper();
    }

    @PostMapping
    public ResponseEntity<?> transcribeAudio(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "targetLanguage", defaultValue = "auto") String targetLanguage
    ) {
        File tempFile = null;

        try {
            System.out.println("📁 File Received: " + file.getOriginalFilename());

            tempFile = File.createTempFile("audio_", "_" + file.getOriginalFilename());
            file.transferTo(tempFile);

            FileSystemResource audioFile = new FileSystemResource(tempFile);

            // ✅ Fix 1: use whisper-large-v3 for Groq (whisper-1 is OpenAI-only)
            OpenAiAudioTranscriptionOptions options =
                    OpenAiAudioTranscriptionOptions.builder()
                            .model("whisper-large-v3")
                            .build();

            AudioTranscriptionPrompt prompt =
                    new AudioTranscriptionPrompt(audioFile, options);

            AudioTranscriptionResponse response =
                    transcriptionModel.call(prompt);

            String text = response.getResult().getOutput();
            System.out.println("📝 Transcribed Text: " + text);

            if (!targetLanguage.equalsIgnoreCase("auto")) {
                text = translateText(text, targetLanguage);
                System.out.println("🌍 Translated Text: " + text);
            }

            return ResponseEntity.ok(text);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("❌ Error: " + e.getMessage());

        } finally {
            if (tempFile != null && tempFile.exists()) {
                boolean deleted = tempFile.delete();
                if (!deleted) {
                    System.err.println("⚠️ Warning: Could not delete temp file: " + tempFile.getAbsolutePath());
                }
            }
        }
    }

    private String translateText(String text, String targetLanguage) {
        try {
            // ✅ Fix 2: build JSON safely with ObjectMapper — no manual string formatting
            String userPrompt = "Translate the following text to " + targetLanguage + ":\n" + text;

            ObjectNode requestBody = objectMapper.createObjectNode();
            requestBody.put("model", "llama3-70b-8192");

            ArrayNode messages = objectMapper.createArrayNode();
            ObjectNode message = objectMapper.createObjectNode();
            message.put("role", "user");
            message.put("content", userPrompt);
            messages.add(message);
            requestBody.set("messages", messages);

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(groqApiKey);
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<String> request = new HttpEntity<>(
                    objectMapper.writeValueAsString(requestBody),
                    headers
            );

            ResponseEntity<String> response = restTemplate.postForEntity(
                    "https://api.groq.com/openai/v1/chat/completions",
                    request,
                    String.class
            );

            return extractContent(response.getBody());

        } catch (Exception e) {
            e.printStackTrace();
            return text; // fall back to original text on translation failure
        }
    }

    private String extractContent(String json) {
        try {
            JsonNode root = objectMapper.readTree(json);
            return root.get("choices").get(0).get("message").get("content").asText();
        } catch (Exception e) {
            e.printStackTrace();
            return json;
        }
    }
}
