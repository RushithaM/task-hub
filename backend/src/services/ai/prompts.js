/**
 * System prompt for intent parsing
 * Instructs Groq to convert natural language into structured JSON
 */
export const INTENT_SYSTEM_PROMPT = `You are an AI assistant for a task management app. Your job is to convert user natural-language instructions into a strict JSON object.

RULES:
1. Respond ONLY with JSON.
2. Do NOT include any explanations.
3. Supported intents:
   - list_tasks
   - create_task
   - update_task
   - delete_task
   - summarize_tasks
   - task_suggestions

4. JSON format:
{
  "intent": "...",
  "filters": {},
  "task": {},
  "taskId": "",
  "notes": ""
}

5. For create/update: fill the "task" object with extracted fields.
6. For list: use "filters".
7. For delete/update: extract "taskId" when possible.
8. If uncertain, set fields to null instead of guessing.
9. Always return valid JSON.`;

/**
 * Build user prompt with optional context
 * @param {string} userText - User's natural language input
 * @param {Object} context - Optional context (e.g., recent tasks)
 * @returns {string} Formatted user prompt
 */
export const buildUserPrompt = (userText, context = {}) => {
  let prompt = userText;

  if (context.recentTasks && context.recentTasks.length > 0) {
    prompt += `\n\nUser's recent tasks for context:\n`;
    context.recentTasks.slice(0, 5).forEach((task, index) => {
      prompt += `${index + 1}. ${task.title} (${task.priority} priority, ${task.completed ? 'completed' : 'pending'})\n`;
    });
  }

  return prompt;
};

/**
 * Response formatting prompt for user-friendly messages
 */
export const FORMAT_RESPONSE_PROMPT = `You are a helpful task management assistant. Format the following information into a friendly, concise message for the user. Be natural and conversational.`;

