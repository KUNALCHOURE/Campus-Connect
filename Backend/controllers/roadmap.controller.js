import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export const generateRoadmap = async (req, res) => {
    try {
        const { topic } = req.body;

        if (!topic) {
            return res.status(400).json({
                success: false,
                message: "Topic is required"
            });
        }

        const prompt = `Generate a comprehensive roadmap for learning ${topic}. Include all necessary topics, concepts, and steps from beginner to advanced levels.

        The roadmap should be structured in this format:
        [
            {
                "title": "${topic} Roadmap",
                "sections": [
                    {
                        "title": "Section Title",
                        "items": [
                            "Item 1",
                            "Item 2"
                        ]
                    }
                ]
            }
        ]
        
        Provide only the JSON array, no additional text.`;

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are an AI roadmap generator. Always respond with valid JSON arrays containing roadmap data."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.7
        });

        if (completion.choices && completion.choices.length > 0) {
            const content = completion.choices[0].message.content;
            try {
                const parsedContent = JSON.parse(content);
                res.json({
                    success: true,
                    data: parsedContent
                });
            } catch (error) {
                console.error('Error parsing JSON:', error);
                res.status(500).json({
                    success: false,
                    message: 'Invalid response format',
                    error: error.message
                });
            }
        } else {
            res.status(500).json({
                success: false,
                message: 'Failed to generate response'
            });
        }
    } catch (error) {
        console.error('Error generating roadmap:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating roadmap',
            error: error.message
        });
    }
}; 