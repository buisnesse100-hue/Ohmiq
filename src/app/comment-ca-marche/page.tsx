import type { Metadata } from "next";
import { Upload, Search, PhoneCall } from "lucide-react";
import { LinkButton } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Comment ça marche" };

export default function CommentCaMarchePage() {
  const steps = [
    { icon: Upload, title: "1. Publie ton annonce", text: "Ajoute un titre, une description, des photos et ton prix. C'est gratuit et ça prend 5 minutes." },
    { icon: Search, title: "2. Sois trouvé", text: "Ton annonce apparaît dans la recherche et les catégories, avec un référencement optimisé." },
    { icon: PhoneCall, title: "3. Sois contacté directement", text: "L'acheteur t'appelle, t'écrit sur WhatsApp ou par email — sans détour." },
  ];

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-2xl font-semibold">Comment ça marche</h1>
      <div className="mt-8 space-y-6">
        {steps.map((step) => (
          <div key={step.title} className="flex gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-signal-soft text-signal-ink">
              <step.icon size={20} />
            </span>
            <div>
              <h2 className="font-display text-lg font-semibold">{step.title}</h2>
              <p className="mt-1 text-muted">{step.text}</p>
            </div>
          </div>
        ))}
      </div>
      <LinkButton href="/publier" variant="signal" size="lg" className="mt-8">
        Publier une annonce
      </LinkButton>
    </div>
  );
}
