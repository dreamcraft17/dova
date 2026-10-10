import { useState } from 'react';
import { DovaAiHelpTrigger, DovaAiHelpWidget } from './DovaAiHelpWidget';

export function DovaAiFloatingWidget() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="dova-ai-floating">
        {!open ? <DovaAiHelpTrigger onClick={() => setOpen(true)} /> : null}
      </div>
      <DovaAiHelpWidget open={open} onClose={() => setOpen(false)} />
    </>
  );
}
