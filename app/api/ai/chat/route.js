import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

// Detailed explanations for seeded mock questions
const mockExplanations = {
  'q-1': `Let's solve the equation **2x + 5 = 13** step-by-step:
1. **Subtract 5 from both sides**:
   $$2x + 5 - 5 = 13 - 5$$
   $$2x = 8$$
2. **Divide both sides by 2**:
   $$\\frac{2x}{2} = \\frac{8}{2}$$
   $$x = 4$$

Therefore, the correct option is **x = 4** (Option B).`,

  'q-2': `A quadratic equation is a second-order polynomial equation in a single variable, with the general form:
$$ax^2 + bx + c = 0$$
where $a \\neq 0$.

Let's analyze the options:
- **x² + 2x + 1 = 0**: The highest exponent of the variable $x$ is 2. This is a quadratic equation (Option B).
- **2x + 3 = 0**: The highest exponent of $x$ is 1. This is a linear equation.
- **3x = 9**: The highest exponent of $x$ is 1. This is a linear equation.
- **x/2 = 4**: The highest exponent of $x$ is 1. This is a linear equation.

Thus, the correct answer is **x² + 2x + 1 = 0**.`,

  'q-3': `To find the value of the function $f(x) = 3x - 2$ at $x = 4$, substitute $4$ in place of $x$:
$$f(4) = 3(4) - 2$$
$$f(4) = 12 - 2$$
$$f(4) = 10$$

Therefore, the correct option is **10** (Option B).`,

  'q-4': `This algebraic expression can be simplified using the **difference of squares formula**:
$$(a + b)(a - b) = a^2 - b^2$$

Substituting $a = x$ and $b = 2$:
$$(x + 2)(x - 2) = x^2 - 2^2 = x^2 - 4$$

Alternatively, you can expand it using the FOIL method (First, Outer, Inner, Last):
1. **First**: $x \\cdot x = x^2$
2. **Outer**: $x \\cdot (-2) = -2x$
3. **Inner**: $2 \\cdot x = 2x$
4. **Last**: $2 \\cdot (-2) = -4$

Summing these up:
$$x^2 - 2x + 2x - 4 = x^2 - 4$$

Thus, the correct option is **x² - 4** (Option A).`,

  'q-5': `Let's solve the inequality **3x - 6 > 9** step-by-step:
1. **Add 6 to both sides**:
   $$3x - 6 + 6 > 9 + 6$$
   $$3x > 15$$
2. **Divide both sides by 3**:
   $$\\frac{3x}{3} > \\frac{15}{3}$$
   $$x > 5$$

Therefore, the correct solution is **x > 5** (Option B).`,

  'q-6': `According to the **Power Rule** of differentiation:
$$\\frac{d}{dx}(x^n) = n \\cdot x^{n-1}$$

For the function $f(x) = x^2$, the exponent $n$ is 2:
$$f'(x) = 2 \\cdot x^{2-1}$$
$$f'(x) = 2x^1 = 2x$$

Therefore, the correct derivative is **2x** (Option B).`,

  'q-7': `According to the **Power Rule** of integration:
$$\\int x^n \\, dx = \\frac{x^{n+1}}{n+1} + C$$

For the integral $\\int 2x \\, dx$, we can pull out the constant:
$$2 \\int x^1 \\, dx = 2 \\left( \\frac{x^{1+1}}{1+1} \\right) + C$$
$$2 \\left( \\frac{x^2}{2} \\right) + C = x^2 + C$$

Therefore, the correct integral is **x² + C** (Option A).`,

  'q-8': `The limit $\\lim_{x \\to 0} \\frac{\\sin(x)}{x}$ is a fundamental trigonometric limit. 

Substituting $x = 0$ directly yields the indeterminate form $\\frac{0}{0}$. We can solve this using **L'Hôpital's Rule**, which states that if a limit is indeterminate, we can take the derivative of the numerator and denominator:
1. Derivative of numerator: $\\frac{d}{dx}(\\sin(x)) = \\cos(x)$
2. Derivative of denominator: $\\frac{d}{dx}(x) = 1$

Now, evaluate the limit:
$$\\lim_{x \\to 0} \\frac{\\cos(x)}{1} = \\frac{\\cos(0)}{1} = \\frac{1}{1} = 1$$

Therefore, the correct limit is **1** (Option B).`,

  'q-9': `The exponential function $f(x) = e^x$ is unique because it is its own derivative.
$$\\frac{d}{dx}(e^x) = e^x$$

This can be proved using the limit definition of the derivative:
$$f'(x) = \\lim_{h \\to 0} \\frac{e^{x+h} - e^x}{h} = e^x \\lim_{h \\to 0} \\frac{e^h - 1}{h} = e^x \\cdot 1 = e^x$$

Therefore, the correct option is **e^x** (Option B).`,

  'q-10': `The derivative of the natural log function is a standard calculus result:
$$\\frac{d}{dx}(\\ln(x)) = \\frac{1}{x}$$
for $x > 0$.

Therefore, the correct option is **1/x** (Option A).`,

  'q-11': `Newton's First Law states that an object will remain at rest or move at a constant velocity in a straight line unless acted upon by a net external force. This tendency of objects to resist any change in their state of motion is known as **inertia**. Thus, it is widely referred to **Law of Inertia** (Option B).`,

  'q-12': `The SI unit of force is the **Newton** (N), named in honor of Isaac Newton's contributions to physics.
1 Newton is the force required to accelerate a mass of $1\\text{ kg}$ at $1\\text{ m/s}^2$:
$$1\\text{ N} = 1\\text{ kg}\\cdot\\text{m/s}^2$$

- **Joule** is the SI unit of work/energy.
- **Watt** is the SI unit of power.
- **Pascal** is the SI unit of pressure.

Therefore, the correct option is **Newton** (Option C).`,

  'q-13': `In classical mechanics, linear momentum ($p$) is defined product of the mass ($m$) of an object and its velocity ($v$):
$$p = mv$$

Momentum is a vector quantity (it has both magnitude and direction) pointing in the same direction velocity.

Therefore, the correct formula is **p = mv** (Option B).`,

  'q-14': `The acceleration due to gravity on the surface of the Earth, represented by $g$, is a constant resulting from Earth's mass and radius. The standard average value used is approximately **9.8 m/s²** (Option B).`,

  'q-15': `In physics, work ($W$) is done when a force ($F$) applied to an object causes a displacement ($d$) in the direction of the force:
$$W = F \\times d \\times \\cos(\\theta)$$
where $\\theta$ is the angle between the force and direction of motion. If they are in the same direction ($\\theta = 0$), the formula simplifies to:
$$W = F \\times d$$

Therefore, the correct option is **Force × Distance** (Option C).`,

  'q-16': `Hydrocarbons are compounds containing only carbon and hydrogen. The simplest possible hydrocarbon is **Methane** ($CH_4$), which contains exactly 1 carbon atom bonded to 4 hydrogen atoms.

- **Ethane** is $C_2H_6$.
- **Propane** is $C_3H_8$.
- **Butane** is $C_4H_{10}$.

Therefore, the correct option is **Methane** (Option B).`,

  'q-17': `The functional group containing an oxygen atom bonded to a hydrogen atom ($\\text{-OH}$) is called the **hydroxyl group** (Option C). Organic compounds containing this group are classified.

- **Aldehyde**: contains a terminal carbonyl group ($\\text{-CHO}$).
- **Ketone**: contains an internal carbonyl group ($\\text{-C(=O)-}$).
- **Carboxyl**: contains a carboxyl group ($\\text{-COOH}$).`,

  'q-18': `Organic chemistry is defined chemistry of carbon compounds. Therefore, organic compounds must primarily contain the element **Carbon** (Option C). Carbon has 4 valence electrons, allowing it to form stable covalent bonds with itself and other elements, creating a wide variety of molecular structures.`,
};

export async function POST( req) {
  try {
    const { message, question, chatHistory } = await req.json();

    if (!message || !question) {
      return NextResponse.json({ error: 'Message and Question are required' }, { status: 400 });
    }

    const { id: questionId, questionText, options, correctOptionId, topic, subject } = question;
    const correctOption = options?.find((o) => o.id === correctOptionId);

    // If Groq API Key is available in the environment, use real Groq AI!
    const apiKey = process.env.GROQ_API_KEY;
    if (apiKey) {
      try {
        const groq = new Groq({ apiKey });

        const historyPrompt = chatHistory && chatHistory.length > 0
          ? `Conversation history:\n${chatHistory.map((h) => `${h.role === 'user' ? 'Student' : 'Tutor'}: ${h.content}`).join('\n')}\n\n`
          : '';

        const systemPrompt = `You are a helpful, encouraging AI Exam Tutor. A student is asking a question about a specific exam problem.
        
Question: "${questionText}"
Subject: ${subject || 'General'}
Topic: ${topic || 'General'}
Options:
${options?.map((o) => `- Option ${o.id.toUpperCase()}: ${o.text}`).join('\n')}
Correct Option: Option ${correctOptionId.toUpperCase()} (${correctOption?.text})

${historyPrompt}Student's question: "${message}"

Please address the student's question directly. Provide a detailed, step-by-step solution to the problem and clarify any points of confusion they have in a structured, easy-to-read markdown format. Use LaTeX notation (e.g. $$x = 4$$) for math where appropriate. Keep your response engaging, concise, and focused on helping them learn.`;

        const completion = await groq.chat.completions.create({
          messages: [
            {
              role: "system",
              content: systemPrompt,
            }
          ],
          model: "llama3-8b-8192",
        });

        const text = completion.choices[0]?.message?.content || "";
        return NextResponse.json({ response: text, explanation: text });
      } catch (err) {
        console.error('Groq API call failed, falling back to local engine:', err);
      }
    }

    // Fallback: Local rule engine
    console.log('Using local tutor rule engine...');
    
    // Check if we have a detailed explanation for this question
    const detailedExplanation = mockExplanations[questionId];
    let responseText = '';

    if (detailedExplanation) {
      responseText = `Hello! I'd be glad to help you understand this problem. Here is the step-by-step solution:

${detailedExplanation}

**Your doubt**: "${message}"
Based on your question, remember that understanding this core concept is crucial. Let me know if you need any clarification on the specific steps!`;
    } else {
      // General fallback response based on the question variables
      responseText = `Great question! Let's examine the problem: **"${questionText}"**

1. **Identify the topic**: This problem relates to **${topic || 'this subject'}** in **${subject || 'your curriculum'}**.
2. **Correct Answer**: The correct option is **Option ${correctOptionId.toUpperCase()}** which states: *"${correctOption?.text}"*.
3. **Why it's correct**: Option ${correctOptionId.toUpperCase()} directly resolves the question constraints. Let's analyze the options:
${options?.map((o) => `   - **Option ${o.id.toUpperCase()}** (${o.text}): ${o.id === correctOptionId ? 'Correct answer.' : 'Incorrect option.'}`).join('\n')}

**Addressing your specific doubt ("${message}")**:
To understand this concept, keep in mind that in ${topic || 'this area'}, we usually apply standard formulas to isolate the variables or identify functional groups. 

Would you like to try another similar practice problem, or goes over a specific step in detail?`;
    }

    return NextResponse.json({ response: responseText });
  } catch (error) {
    console.error('AI Chat Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
