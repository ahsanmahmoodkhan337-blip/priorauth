'use client';

import dynamic from 'next/dynamic';

const DeepAICopilot = dynamic(() => import('@/components/HUD/DeepAICopilot'), {
  ssr: false,
});

export default function DeepAICopilotWrapper() {
  return <DeepAICopilot />;
}
