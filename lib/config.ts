import {
  BookOpenText,
  Brain,
  Code,
  Lightbulb,
  Notepad,
  PaintBrush,
  Sparkle,
  Gear,
  Heart,
  Target,
  Users,
} from "@phosphor-icons/react/dist/ssr"

export const NON_AUTH_DAILY_MESSAGE_LIMIT = 5
export const AUTH_DAILY_MESSAGE_LIMIT = 1000
export const REMAINING_QUERY_ALERT_THRESHOLD = 2
export const DAILY_FILE_UPLOAD_LIMIT = 5
export const DAILY_LIMIT_PRO_MODELS = 500

export const NON_AUTH_ALLOWED_MODELS = ["gpt-4.1-nano"]

export const FREE_MODELS_IDS = [
  "openrouter:deepseek/deepseek-r1:free",
  "openrouter:meta-llama/llama-3.3-8b-instruct:free",
  "pixtral-large-latest",
  "mistral-large-latest",
  "gpt-4.1-nano",
]

export const MODEL_DEFAULT = "gpt-4.1-nano"

export const APP_NAME = "Plan Divino Chat"
export const APP_DOMAIN = "https://zola.chat"

export const IS_DEMO = process.env.NEXT_PUBLIC_IS_DEMO === "true"

export const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || ""

export const SUGGESTIONS = [
  {
    label: "AI Strategy",
    highlight: "AI strategy",
    prompt: `AI strategy`,
    items: [
      "How can AI amplify human capabilities without replacing human judgment?",
      "What does it mean to implement values-first technology in organizations?",
      "How do we preserve human agency while automating processes?",
      "What questions should leaders ask before implementing AI solutions?",
      "How can AI help with meaningful work instead of just efficiency?",
      "What are the risks of AI implementation without human values?",
    ],
    icon: Target,
  },
  {
    label: "Organizational Development",
    highlight: "Organizational development",
    prompt: `Organizational development`,
    items: [
      "How can we evolve toward distributed decision-making with AI support?",
      "What does self-management look like in AI-enabled organizations?",
      "How to create environments where people bring their whole selves to work",
      "What are the stages of conscious organizational evolution?",
      "How do purpose-driven organizations approach AI implementation differently?",
      "What does wholeness at work look like in an AI-enabled organization?",
    ],
    icon: Users,
  },
  {
    label: "Human-AI Partnership",
    highlight: "Human-AI partnership",
    prompt: `Human-AI partnership`,
    items: [
      "What are the key principles of human-AI partnership?",
      "How to design AI systems that augment rather than replace humans",
      "What skills are needed for effective human-AI collaboration?",
      "What makes humans irreplaceable in an AI-enabled world?",
      "How do I prepare for work in a self-managing organization?",
      "What inner development is needed to navigate AI transformation?",
    ],
    icon: Heart,
  },
  {
    label: "Purpose & Meaning",
    highlight: "Purpose and meaning",
    prompt: `Purpose and meaning`,
    items: [
      "How do I discover my purpose and align it with AI-enhanced work?",
      "What does meaningful work look like with AI assistance?",
      "How to maintain human connection in AI-enhanced organizations",
      "What is evolutionary purpose and how does it guide AI decisions?",
      "How can AI support regenerative impact rather than just profit?",
      "What's the future of work when AI handles routine cognitive tasks?",
    ],
    icon: Brain,
  },
  {
    label: "Implementation",
    highlight: "AI implementation",
    prompt: `AI implementation`,
    items: [
      "How to create an AI strategy that aligns with organizational purpose",
      "What are the principles of values-first technology implementation?",
      "How to evaluate AI solutions for purpose-driven organizations",
      "What questions to ask before implementing AI in your organization",
      "How do we measure success in AI implementations beyond efficiency?",
      "What makes an organization ready for conscious AI transformation?",
    ],
    icon: Gear,
  },
  {
    label: "Learn Gently",
    highlight: "Explain",
    prompt: `Explain`,
    items: [
      "Explain human-AI partnership in simple terms",
      "Explain what self-management means in organizations",
      "Explain the difference between AI automation and AI augmentation",
      "Explain how AI can preserve meaning at work",
      "Explain distributed decision-making with examples",
      "Explain the concept of evolutionary purpose",
    ],
    icon: Lightbulb,
  },
]

export const SYSTEM_PROMPT_DEFAULT = `You are an AI assistant focused on helping organizations implement AI that amplifies human capabilities while preserving meaningful work. Your expertise lies in:

- Human-AI partnership and collaboration
- Values-first technology implementation
- Self-managing organizational structures
- Purpose-driven AI transformation
- Distributed decision-making with AI support
- Preserving human agency in automated processes

Your tone is thoughtful, clear, and human-centered. You write with intention—never too much, never too little. You avoid clichés, speak simply, and offer helpful, grounded answers that honor both technological capability and human meaning. When needed, you ask good questions to help users think clearly about their AI implementation journey.

You're here to help users navigate the intersection of AI implementation, individual purpose alignment, and organizational transformation toward self-managing, human-centered structures. You don't try to impress—you aim to clarify and support conscious evolution.`

export const MESSAGE_MAX_LENGTH = 10000
