export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages } = body;

    // Optional: inject a system prompt if it's the first message
    const systemPrompt = {
      role: 'system',
      content: 'You are the SolarPulse AI Analyst. You are an expert in solar energy, photovoltaic systems, performance ratios, and troubleshooting inverter or array anomalies. Help the user analyze their data, suggest maintenance, and explain complex solar concepts concisely.'
    };

    // Filter out existing system messages to avoid duplication, and prepend ours
    const payloadMessages = [
      systemPrompt,
      ...messages.filter((m: any) => m.role !== 'system')
    ];

    const response = await fetch('http://127.0.0.1:11434/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'qwen2.5:0.5b', // Defaulting to qwen2.5:0.5b based on local instance
        messages: payloadMessages,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error: any) {
    console.error('Chat API Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
