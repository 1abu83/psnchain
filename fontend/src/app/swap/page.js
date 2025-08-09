import SwapForm from '../components/swap-form';

export default function SwapPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-foreground mb-6">Swap Tokens</h1>
      <SwapForm />
    </div>
  );
}