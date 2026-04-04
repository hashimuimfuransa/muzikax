'use client';

import AIFloatingButton from './AIFloatingButton';
import ContactFloatingButton from './ContactFloatingButton';

export default function FloatingComponents() {
  // AI Assistant floating button - hidden on production (still in development)
  const showAIAssistant = process.env.NEXT_PUBLIC_SHOW_AI_ASSISTANT === 'true';
  
  return (
    <>
      {showAIAssistant && <AIFloatingButton />}
      <ContactFloatingButton />
    </>
  );
}