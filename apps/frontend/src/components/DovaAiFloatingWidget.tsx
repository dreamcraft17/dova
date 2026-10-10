import { useState } from 'react';
import { DovaAiHelpTrigger, DovaAiHelpWidget } from './DovaAiHelpWidget';

export function DovaAiFloatingWidget() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="dova-ai-floating">
        <DovaAiHelpTrigger onClick={() => setOpen(true)} />
      </div>
      <DovaAiHelpWidget open={open} onClose={() => setOpen(false)} />
    </>
  );
}
