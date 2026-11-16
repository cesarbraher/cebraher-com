import { recordInteraction } from '../lib/analytics';

interface PayPalDonateButtonProps {
  className?: string;
}

export function PayPalDonateButton({ className = '' }: PayPalDonateButtonProps) {
  return (
    <form
      action="https://www.paypal.com/donate"
      method="post"
      target="_top"
      onSubmit={() => recordInteraction('paypalDonateClicks')}
      className={`inline-flex ${className}`}
    >
      <input type="hidden" name="hosted_button_id" value="MRSWVW2JAUWU8" />
      <input type="hidden" name="return" value="https://www.cebraher.com/gracias-por-donar" />
      <input type="hidden" name="cancel_return" value="https://www.cebraher.com/cancelar-donacion" />
      <button
        type="submit"
        title="Donar con PayPal a Cesar Braher"
        aria-label="Donaciones con PayPal"
        className="inline-flex items-center gap-2.5 px-6 py-3 rounded-lg bg-amber-500 text-zinc-950 text-sm font-extrabold tracking-wide hover:bg-amber-400 transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 shadow-sm"
      >
        <svg
          viewBox="0 0 24 24"
          className="w-4 h-4 fill-zinc-950 shrink-0"
          aria-hidden="true"
        >
          <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 2.79A.773.773 0 0 1 5.707 2.1h6.768c2.256 0 3.922.52 4.953 1.547.96.956 1.298 2.332 1.006 4.088-.028.17-.062.345-.1.522-.648 3.046-2.707 4.783-5.955 4.783H9.89a.774.774 0 0 0-.764.652l-.915 5.8-.26 1.642a.49.49 0 0 1-.484.415h-.391v-.212zm12.393-12.56c-.032.177-.069.358-.11.544-.75 3.455-3.133 5.207-6.794 5.207h-1.88a.926.926 0 0 0-.914.781l-.99 6.278-.28 1.772a.495.495 0 0 0 .489.573h3.437a.678.678 0 0 0 .67-.571l.027-.143.532-3.368.034-.186a.678.678 0 0 1 .67-.571h.422c2.732 0 4.871-1.11 5.497-4.319.261-1.341.126-2.46-.565-3.245-.21-.238-.473-.441-.785-.607.014-.148.027-.298.04-.445z" />
        </svg>
        <span className="text-zinc-950 font-extrabold uppercase tracking-wider">DONACIONES</span>
      </button>
      <img
        alt=""
        src="https://www.paypal.com/es_MX/i/scr/pixel.gif"
        width="1"
        height="1"
        className="hidden"
      />
    </form>
  );
}
